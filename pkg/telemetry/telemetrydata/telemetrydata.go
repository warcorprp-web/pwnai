// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

package telemetrydata

// Telemetry disabled - minimal type definitions

type TEvent struct {
	Event     string      `json:"event,omitempty"`
	EventType string      `json:"eventtype"`
	Props     TEventProps `json:"props,omitempty"`
}

type TEventProps map[string]interface{}

// Exported constants for use in other packages
const (
	ConnType                   = "conn:type"
	ConnWshErrorCode           = "conn:wsherrorcode"
	BlockView                  = "block:view"
	BlockController            = "block:controller"
	AiBackendType              = "ai:backendtype"
	AiLocal                    = "ai:local"
	WaveAIAPIType              = "waveai:apitype"
	WaveAIModel                = "waveai:model"
	WaveAIChatId               = "waveai:chatid"
	WaveAIStepNum              = "waveai:stepnum"
	WaveAIInputTokens          = "waveai:inputtokens"
	WaveAIOutputTokens         = "waveai:outputtokens"
	WaveAINativeWebSearchCount = "waveai:nativewebsearchcount"
	WaveAIRequestCount         = "waveai:requestcount"
	WaveAIToolUseCount         = "waveai:toolusecount"
)

func MakeTEvent(eventType string) *TEvent {
	return &TEvent{
		EventType: eventType,
		Props:     make(TEventProps),
	}
}
