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

const (
	ConnType          = "conn:type"
	ConnWshErrorCode  = "conn:wsherrorcode"
)
