// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

package aiusechat

import (
	"github.com/wavetermdev/waveterm/pkg/aiusechat/uctypes"
)

// GetPwnAIToolDefinitions возвращает все инструменты для PwnAI
func GetPwnAIToolDefinitions() []uctypes.ToolDefinition {
	return []uctypes.ToolDefinition{
		// MSF Pentest tools
		{
			Name:        "pwnai_scan_target",
			DisplayName: "Scan Target",
			Description: "Сканирование цели через nmap (Metasploit). Автоматически анализирует уязвимости.",
			InputSchema: map[string]any{
				"type": "object",
				"properties": map[string]any{
					"target": map[string]any{
						"type":        "string",
						"description": "IP адрес или CIDR (например '192.168.1.100' или '192.168.1.0/24')",
					},
					"scan_type": map[string]any{
						"type":        "string",
						"enum":        []string{"quick", "full", "stealth"},
						"description": "Тип сканирования: quick (топ 1000 портов), full (все порты), stealth (SYN)",
					},
				},
				"required": []string{"target"},
			},
		},
		{
			Name:    "pwnai_search_exploits",
			DisplayName: "Search Exploits",
			Description: "Поиск эксплойтов в базе Metasploit по названию сервиса, CVE или ключевым словам.",
			InputSchema: map[string]any{
				"type": "object",
				"properties": map[string]any{
					"query": map[string]any{
						"type":        "string",
						"description": "Поисковый запрос (SMB, Apache, MS17-010, CVE-2021-44228)",
					},
				},
				"required": []string{"query"},
			},
		},
		{
			Name:    "pwnai_exploit_target",
			DisplayName: "Exploit Target",
			Description: "Эксплуатация уязвимости через Metasploit. Создаёт meterpreter сессию.",
			InputSchema: map[string]any{
				"type": "object",
				"properties": map[string]any{
					"target": map[string]any{
						"type":        "string",
						"description": "IP адрес цели",
					},
					"exploit": map[string]any{
						"type":        "string",
						"description": "Путь к эксплойту (exploit/windows/smb/ms17_010_eternalblue)",
					},
					"port": map[string]any{
						"type":        "number",
						"description": "Порт цели (по умолчанию 445)",
					},
					"lhost": map[string]any{
						"type":        "string",
						"description": "IP адрес атакующего (LHOST)",
					},
				},
				"required": []string{"target", "exploit"},
			},
		},
		{
			Name:    "pwnai_list_sessions",
			DisplayName: "List Sessions",
			Description: "Список активных meterpreter/shell сессий в Metasploit.",
			InputSchema: map[string]any{
				"type":       "object",
				"properties": map[string]any{},
			},
		},
		{
			Name:    "pwnai_run_session_command",
			DisplayName: "Run Session Command",
			Description: "Выполнение команды в активной сессии (sysinfo, hashdump, screenshot, shell).",
			InputSchema: map[string]any{
				"type": "object",
				"properties": map[string]any{
					"session_id": map[string]any{
						"type":        "number",
						"description": "ID сессии",
					},
					"command": map[string]any{
						"type":        "string",
						"description": "Команда для выполнения",
					},
				},
				"required": []string{"session_id", "command"},
			},
		},
		{
			Name:    "pwnai_msf_rpc_call",
			DisplayName: "MSF RPC Call",
			Description: "Прямой вызов Metasploit RPC API для продвинутых операций.",
			InputSchema: map[string]any{
				"type": "object",
				"properties": map[string]any{
					"method": map[string]any{
						"type":        "string",
						"description": "Метод RPC (module.search, console.create, db.hosts)",
					},
					"params": map[string]any{
						"type":        "array",
						"description": "Параметры метода",
					},
				},
				"required": []string{"method"},
			},
		},
	}
}
