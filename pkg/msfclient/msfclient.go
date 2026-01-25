// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

package msfclient

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// MsfClient - клиент для работы с Metasploit RPC API
type MsfClient struct {
	Host   string
	Port   int
	Token  string
	client *http.Client
}

// RPCRequest - структура запроса к MSF RPC
type RPCRequest struct {
	Method string        `json:"method"`
	Params []interface{} `json:"params"`
}

// RPCResponse - структура ответа от MSF RPC
type RPCResponse struct {
	Result interface{}            `json:"result"`
	Error  map[string]interface{} `json:"error"`
}

// NewMsfClient создаёт новый клиент MSF RPC
func NewMsfClient(host string, port int) *MsfClient {
	return &MsfClient{
		Host: host,
		Port: port,
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// Authenticate выполняет аутентификацию в MSF RPC
func (c *MsfClient) Authenticate(username, password string) error {
	resp, err := c.call("auth.login", []interface{}{username, password})
	if err != nil {
		return fmt.Errorf("ошибка аутентификации: %w", err)
	}

	if resp.Error != nil {
		return fmt.Errorf("ошибка MSF: %v", resp.Error)
	}

	// Извлекаем токен
	if result, ok := resp.Result.(map[string]interface{}); ok {
		if token, ok := result["token"].(string); ok {
			c.Token = token
			return nil
		}
	}

	return fmt.Errorf("не удалось получить токен")
}

// Call выполняет RPC вызов к MSF
func (c *MsfClient) Call(method string, params []interface{}) (interface{}, error) {
	if c.Token == "" {
		return nil, fmt.Errorf("не выполнена аутентификация")
	}

	// Добавляем токен в начало параметров
	allParams := append([]interface{}{c.Token}, params...)
	resp, err := c.call(method, allParams)
	if err != nil {
		return nil, err
	}

	if resp.Error != nil {
		return nil, fmt.Errorf("ошибка MSF: %v", resp.Error)
	}

	return resp.Result, nil
}

// call выполняет низкоуровневый HTTP запрос
func (c *MsfClient) call(method string, params []interface{}) (*RPCResponse, error) {
	url := fmt.Sprintf("http://%s:%d/api/", c.Host, c.Port)

	request := RPCRequest{
		Method: method,
		Params: params,
	}

	body, err := json.Marshal(request)
	if err != nil {
		return nil, fmt.Errorf("ошибка сериализации: %w", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		return nil, fmt.Errorf("ошибка создания запроса: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("ошибка HTTP запроса: %w", err)
	}
	defer resp.Body.Close()

	var rpcResp RPCResponse
	if err := json.NewDecoder(resp.Body).Decode(&rpcResp); err != nil {
		return nil, fmt.Errorf("ошибка декодирования ответа: %w", err)
	}

	return &rpcResp, nil
}

// IsConnected проверяет подключение к MSF
func (c *MsfClient) IsConnected() bool {
	if c.Token == "" {
		return false
	}

	_, err := c.Call("core.version", []interface{}{})
	return err == nil
}
