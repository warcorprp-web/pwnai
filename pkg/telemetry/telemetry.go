// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

package telemetry

import (
	"context"
)

// Telemetry disabled - all functions are no-ops

func IsTelemetryEnabled() bool {
	return false
}

func RecordTEvent(ctx context.Context, event interface{}) error {
	return nil
}

func GoRecordTEventWrap(event interface{}) {
	// no-op
}

func GoUpdateActivityWrap(activity interface{}) {
	// no-op
}

func Shutdown() {
	// no-op
}
