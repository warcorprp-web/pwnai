// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

package telemetry

import (
	"context"
)

// Telemetry disabled - all functions are no-ops

type ActivityType string

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

func GetNonUploadedTEvents() ([]interface{}, error) {
	return nil, nil
}

func MarkTEventsAsUploaded(ids []string) error {
	return nil
}

func CleanOldTEvents() error {
	return nil
}

func GetNonUploadedActivity() ([]interface{}, error) {
	return nil, nil
}

func MarkActivityAsUploaded(ids []string) error {
	return nil
}

func Shutdown() {
	// no-op
}
