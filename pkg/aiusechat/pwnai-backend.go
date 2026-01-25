// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

package aiusechat

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/wavetermdev/waveterm/pkg/aiclient"
	"github.com/wavetermdev/waveterm/pkg/aiusechat/uctypes"
	"github.com/wavetermdev/waveterm/pkg/pentest"
)

// pwnaiBackend реализует UseChatBackend для PwnAI
type pwnaiBackend struct {
	aiClient *aiclient.ClaudeClient
}

var _ UseChatBackend = (*pwnaiBackend)(nil)

func init() {
	// Регистрируем PwnAI backend
	RegisterBackend("pwnai", func() UseChatBackend {
		return &pwnaiBackend{
			aiClient: aiclient.NewClaudeClient("879621"),
		}
	})
}

func (b *pwnaiBackend) StreamCompletion(
	ctx context.Context,
	request uctypes.UseChatRequest,
) chan uctypes.UseChatResponse {
	respChan := make(chan uctypes.UseChatResponse)

	go func() {
		defer close(respChan)

		// Конвертируем сообщения
		messages := make([]aiclient.Message, 0, len(request.Messages)+1)
		
		// Добавляем System Prompt в начало
		messages = append(messages, aiclient.Message{
			Role:    "system",
			Content: pentest.PwnAISystemPrompt,
		})
		
		for _, msg := range request.Messages {
			content := msg.Content
			if msg.Content == "" && len(msg.Parts) > 0 {
				// Собираем контент из частей
				for _, part := range msg.Parts {
					if part.Type == "text" {
						content += part.Text
					}
				}
			}

			messages = append(messages, aiclient.Message{
				Role:    msg.Role,
				Content: content,
			})
		}

		// Получаем PwnAI tools
		tools := pentest.GetPentestTools()

		// Отправляем запрос к Claude
		response, err := b.aiClient.Chat(messages, tools)
		if err != nil {
			respChan <- uctypes.UseChatResponse{
				Type:  uctypes.ResponseTypeError,
				Error: fmt.Sprintf("Ошибка AI: %v", err),
			}
			return
		}

		// Обрабатываем ответ
		if response.HasToolUse() {
			// AI хочет вызвать инструмент
			toolUses := response.ExtractToolUses()
			
			for _, toolUse := range toolUses {
				// Отправляем tool_use
				toolUseData, _ := json.Marshal(map[string]interface{}{
					"type":  "tool_use",
					"id":    toolUse.ID,
					"name":  toolUse.Name,
					"input": toolUse.Input,
				})

				respChan <- uctypes.UseChatResponse{
					Type:    uctypes.ResponseTypeToolCall,
					ToolCall: &uctypes.ToolCall{
						ID:   toolUse.ID,
						Name: toolUse.Name,
						Args: string(toolUseData),
					},
				}

				log.Printf("🔧 AI вызывает инструмент: %s", toolUse.Name)
			}
		} else {
			// Обычный текстовый ответ
			text := response.ExtractText()
			if text != "" {
				respChan <- uctypes.UseChatResponse{
					Type: uctypes.ResponseTypeContent,
					Text: text,
				}
			}
		}

		// Финальное сообщение
		respChan <- uctypes.UseChatResponse{
			Type: uctypes.ResponseTypeDone,
		}
	}()

	return respChan
}

func (b *pwnaiBackend) GetModel() string {
	return "claude-sonnet-4-5"
}

func (b *pwnaiBackend) GetAPIType() string {
	return "pwnai"
}

// RegisterBackend регистрирует новый backend
var backendRegistry = make(map[string]func() UseChatBackend)

func RegisterBackend(name string, factory func() UseChatBackend) {
	backendRegistry[name] = factory
}

func GetBackendByName(name string) (UseChatBackend, error) {
	factory, ok := backendRegistry[name]
	if !ok {
		return nil, fmt.Errorf("backend %s не найден", name)
	}
	return factory(), nil
}
