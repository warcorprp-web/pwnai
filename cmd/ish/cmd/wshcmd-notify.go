// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
	"github.com/wavetermdev/waveterm/pkg/wshrpc"
	"github.com/wavetermdev/waveterm/pkg/wshrpc/wshclient"
	"github.com/wavetermdev/waveterm/pkg/wshutil"
)

var notifyTitle string
var notifySilent bool

var setNotifyCmd = &cobra.Command{
	Use:     "notify <message> [-t <title>] [-s]",
	Short:   "создать уведомление",
	Args:    cobra.ExactArgs(1),
	RunE:    notifyRun,
	PreRunE: preRunSetupRpcClient,
}

func init() {
	setNotifyCmd.Flags().StringVarP(&notifyTitle, "title", "t", "Wsh Notify", "заголовок уведомления")
	setNotifyCmd.Flags().BoolVarP(&notifySilent, "silent", "s", false, "отключить ли звук уведомления")
	rootCmd.AddCommand(setNotifyCmd)
}

func notifyRun(cmd *cobra.Command, args []string) (rtnErr error) {
	defer func() {
		sendActivity("notify", rtnErr == nil)
	}()
	message := args[0]
	notificationOptions := &wshrpc.WaveNotificationOptions{
		Title:  notifyTitle,
		Body:   message,
		Silent: notifySilent,
	}
	err := wshclient.NotifyCommand(RpcClient, *notificationOptions, &wshrpc.RpcOpts{Timeout: 2000, Route: wshutil.ElectronRoute})
	if err != nil {
		return fmt.Errorf("sending notification: %w", err)
	}
	return nil
}
