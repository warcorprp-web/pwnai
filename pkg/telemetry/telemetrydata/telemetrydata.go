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

type TEventUserProps map[string]interface{}

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
	WaveAIToolUseErrorCount    = "waveai:tooluseerrorcount"
	WaveAIToolDetail           = "waveai:tooldetail"
	WaveAIPremiumReq           = "waveai:premiumreq"
	WaveAIProxyReq             = "waveai:proxyreq"
	WaveAIHadError             = "waveai:haderror"
	WaveAIImageCount           = "waveai:imagecount"
	WaveAIPDFCount             = "waveai:pdfcount"
	WaveAITextDocCount         = "waveai:textdoccount"
	WaveAITextLen              = "waveai:textlen"
	WaveAIFirstByteMs          = "waveai:firstbytems"
	WaveAITotalMs              = "waveai:totalms"
	WaveAIRequestDurMs         = "waveai:requestdurms"
	WaveAIWidgetAccess         = "waveai:widgetaccess"
	WaveAIThinkingLevel        = "waveai:thinkinglevel"
	WaveAIMode                 = "waveai:mode"
	WaveAIProvider             = "waveai:provider"
	WaveAIIsLocal              = "waveai:islocal"
	WshHadError                = "wsh:haderror"
	WshCmd                     = "wsh:cmd"
	PanicType                  = "panic:type"
	CountBlocks                = "count:blocks"
	CountTabs                  = "count:tabs"
	CountWindows               = "count:windows"
	CountWorkspaces            = "count:workspaces"
	CountSSHConn               = "count:sshconn"
	CountWSLConn               = "count:wslconn"
	CountViews                 = "count:views"
	UserSet                    = "user:set"
	SettingsCustomWidgets      = "settings:customwidgets"
	SettingsCustomAIPresets    = "settings:customaipresets"
	SettingsCustomSettings     = "settings:customsettings"
	SettingsCustomAIModes      = "settings:customaimodes"
	SettingsSecretsCount       = "settings:secretscount"
	ClientInitialVersion       = "client:initialversion"
	CohortMonth                = "cohort:month"
	CohortISOWeek              = "cohort:isoweek"
	UserSetOnce                = "user:setonce"
	AppFirstLaunch             = "app:firstlaunch"
)

func MakeTEvent(eventType string, props ...TEventProps) *TEvent {
	event := &TEvent{
		EventType: eventType,
		Props:     make(TEventProps),
	}
	if len(props) > 0 {
		event.Props = props[0]
	}
	return event
}
