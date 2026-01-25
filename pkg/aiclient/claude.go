// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

package aiclient

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// ClaudeClient - клиент для работы с Claude API
type ClaudeClient struct {
	APIKey string
	APIURL string
	client *http.Client
}

// Message - сообщение в чате
type Message struct {
	Role    string      `json:"role"`
	Content interface{} `json:"content"`
}

// Tool - инструмент для AI
type Tool struct {
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	InputSchema map[string]interface{} `json:"input_schema"`
}

// ToolUse - вызов инструмента от AI
type ToolUse struct {
	Type  string                 `json:"type"`
	ID    string                 `json:"id"`
	Name  string                 `json:"name"`
	Input map[string]interface{} `json:"input"`
}

// ChatRequest - запрос к Claude API
type ChatRequest struct {
	Model     string    `json:"model"`
	MaxTokens int       `json:"max_tokens"`
	Messages  []Message `json:"messages"`
	Tools     []Tool    `json:"tools,omitempty"`
}

// ChatResponse - ответ от Claude API
type ChatResponse struct {
	ID         string                   `json:"id"`
	Type       string                   `json:"type"`
	Role       string                   `json:"role"`
	Content    []map[string]interface{} `json:"content"`
	StopReason string                   `json:"stop_reason"`
	Usage      map[string]interface{}   `json:"usage"`
}

// NewClaudeClient создаёт новый клиент Claude API
func NewClaudeClient(apiKey string) *ClaudeClient {
	return &ClaudeClient{
		APIKey: apiKey,
		APIURL: "https://api.ceiller.ru/claude-kiro-oauth/v1/messages",
		client: &http.Client{
			Timeout: 60 * time.Second,
		},
	}
}

// Chat отправляет сообщения в Claude и получает ответ
func (c *ClaudeClient) Chat(messages []Message, tools []Tool) (*ChatResponse, error) {
	request := ChatRequest{
		Model:     "claude-sonnet-4-5",
		MaxTokens: 4096,
		Messages:  messages,
		Tools:     tools,
	}

	body, err := json.Marshal(request)
	if err != nil {
		return nil, fmt.Errorf("ошибка сериализации: %w", err)
	}

	req, err := http.NewRequest("POST", c.APIURL, bytes.NewBuffer(body))
	if err != nil {
		return nil, fmt.Errorf("ошибка создания запроса: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", c.APIKey)
	req.Header.Set("anthropic-version", "2023-06-01")

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("ошибка HTTP запроса: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("ошибка API: статус %d", resp.StatusCode)
	}

	var chatResp ChatResponse
	if err := json.NewDecoder(resp.Body).Decode(&chatResp); err != nil {
		return nil, fmt.Errorf("ошибка декодирования ответа: %w", err)
	}

	return &chatResp, nil
}

// ExtractToolUses извлекает вызовы инструментов из ответа
func (c *ChatResponse) ExtractToolUses() []ToolUse {
	var toolUses []ToolUse

	for _, content := range c.Content {
		if contentType, ok := content["type"].(string); ok && contentType == "tool_use" {
			toolUse := ToolUse{
				Type: contentType,
			}

			if id, ok := content["id"].(string); ok {
				toolUse.ID = id
			}
			if name, ok := content["name"].(string); ok {
				toolUse.Name = name
			}
			if input, ok := content["input"].(map[string]interface{}); ok {
				toolUse.Input = input
			}

			toolUses = append(toolUses, toolUse)
		}
	}

	return toolUses
}

// ExtractText извлекает текстовый ответ
func (c *ChatResponse) ExtractText() string {
	for _, content := range c.Content {
		if contentType, ok := content["type"].(string); ok && contentType == "text" {
			if text, ok := content["text"].(string); ok {
				return text
			}
		}
	}
	return ""
}

// HasToolUse проверяет есть ли вызовы инструментов
func (c *ChatResponse) HasToolUse() bool {
	return c.StopReason == "tool_use"
}
