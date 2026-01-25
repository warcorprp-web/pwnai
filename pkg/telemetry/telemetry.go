// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

package telemetry

import (
	"context"

	"github.com/wavetermdev/waveterm/pkg/telemetry/telemetrydata"
)

// Telemetry disabled - all functions are no-ops

type ActivityType struct{}

func IsTelemetryEnabled() bool {
	return false
}

func IsAutoUpdateEnabled() bool {
	return false
}

func AutoUpdateChannel() string {
	return ""
}

func RecordTEvent(ctx context.Context, event interface{}) error {
	return nil
}

func GoRecordTEventWrap(event interface{}) {
	// no-op
}

func GoUpdateActivityWrap(activity interface{}, args ...interface{}) {
	// no-op
}

func GetNonUploadedTEvents(ctx context.Context, limit int) ([]*telemetrydata.TEvent, error) {
	return nil, nil
}

func MarkTEventsAsUploaded(ctx context.Context, events []*telemetrydata.TEvent) error {
	return nil
}

func CleanOldTEvents(ctx context.Context) error {
	return nil
}

func GetNonUploadedActivity(ctx context.Context) ([]*ActivityType, error) {
	return nil, nil
}

func MarkActivityAsUploaded(ctx context.Context, activity []*ActivityType) error {
	return nil
}

func UpdateActivity(ctx context.Context, update interface{}) error {
	return nil
}

func GetTosAgreedTs() int64 {
	return 0
}

func TruncateActivityTEventForShutdown(event interface{}) interface{} {
	return nil
}

func Shutdown() {
	// no-op
}
