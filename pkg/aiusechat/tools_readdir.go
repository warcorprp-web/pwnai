// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

package aiusechat

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/wavetermdev/waveterm/pkg/aiusechat/uctypes"
	"github.com/wavetermdev/waveterm/pkg/util/fileutil"
	"github.com/wavetermdev/waveterm/pkg/util/utilfn"
	"github.com/wavetermdev/waveterm/pkg/wavebase"
)

const ReadDirDefaultMaxEntries = 500
const ReadDirHardMaxEntries = 10000

type readDirParams struct {
	Path       string `json:"path"`
	MaxEntries *int   `json:"max_entries"`
}

func parseReadDirInput(input any) (*readDirParams, error) {
	result := &readDirParams{}

	if input == nil {
		return nil, fmt.Errorf("требуется входной параметр")
	}

	if err := utilfn.ReUnmarshal(result, input); err != nil {
		return nil, fmt.Errorf("неверный формат входных данных: %w", err)
	}

	if result.Path == "" {
		return nil, fmt.Errorf("отсутствует параметр path")
	}

	if result.MaxEntries == nil {
		maxEntries := ReadDirDefaultMaxEntries
		result.MaxEntries = &maxEntries
	}

	if *result.MaxEntries < 1 {
		return nil, fmt.Errorf("max_entries должно быть минимум 1, получено %d", *result.MaxEntries)
	}

	if *result.MaxEntries > ReadDirHardMaxEntries {
		return nil, fmt.Errorf("max_entries не может превышать %d, получено %d", ReadDirHardMaxEntries, *result.MaxEntries)
	}

	return result, nil
}

func verifyReadDirInput(input any, toolUseData *uctypes.UIMessageDataToolUse) error {
	params, err := parseReadDirInput(input)
	if err != nil {
		return err
	}

	expandedPath, err := wavebase.ExpandHomeDir(params.Path)
	if err != nil {
		return fmt.Errorf("не удалось развернуть путь: %w", err)
	}

	if !filepath.IsAbs(expandedPath) {
		return fmt.Errorf("путь должен быть абсолютным, получен относительный путь: %s", params.Path)
	}

	fileInfo, err := os.Stat(expandedPath)
	if err != nil {
		return fmt.Errorf("не удалось получить информацию о пути: %w", err)
	}

	if !fileInfo.IsDir() {
		return fmt.Errorf("путь не является директорией, не может быть прочитан инструментом read_dir. используйте инструмент read_text_file для чтения файлов")
	}

	return nil
}

func readDirCallback(input any, toolUseData *uctypes.UIMessageDataToolUse) (any, error) {
	params, err := parseReadDirInput(input)
	if err != nil {
		return nil, err
	}

	expandedPath, err := wavebase.ExpandHomeDir(params.Path)
	if err != nil {
		return nil, fmt.Errorf("не удалось развернуть путь: %w", err)
	}

	if !filepath.IsAbs(expandedPath) {
		return nil, fmt.Errorf("путь должен быть абсолютным, получен относительный путь: %s", params.Path)
	}

	result, err := fileutil.ReadDir(params.Path, *params.MaxEntries)
	if err != nil {
		return nil, err
	}

	resultMap := map[string]any{
		"path":          result.Path,
		"absolute_path": result.AbsolutePath,
		"entry_count":   result.EntryCount,
		"total_entries": result.TotalEntries,
		"entries":       result.Entries,
	}

	if result.Truncated {
		resultMap["truncated"] = true
		resultMap["truncated_message"] = fmt.Sprintf("Directory listing truncated to %d entries (out of %d total). Increase max_entries to see more.", result.EntryCount, result.TotalEntries)
	}

	if result.ParentDir != "" {
		resultMap["parent_dir"] = result.ParentDir
	}

	return resultMap, nil
}

func GetReadDirToolDefinition() uctypes.ToolDefinition {
	return uctypes.ToolDefinition{
		Name:        "read_dir",
		DisplayName: "Чтение директории",
		Description: "Read a directory from the filesystem and list its contents. Returns information about files and subdirectories including names, types, sizes, permissions, and modification times.",
		ToolLogName: "gen:readdir",
		Strict:      false,
		InputSchema: map[string]any{
			"type": "object",
			"properties": map[string]any{
				"path": map[string]any{
					"type":        "string",
					"description": "Absolute path to the directory to read. Supports '~' for the user's home directory. Relative paths are not supported.",
				},
				"max_entries": map[string]any{
					"type":        "integer",
					"minimum":     1,
					"maximum":     10000,
					"default":     500,
					"description": "Maximum number of entries to return. Defaults to 500, max 10000.",
				},
			},
			"required":             []string{"path"},
			"additionalProperties": false,
		},
		ToolCallDesc: func(input any, output any, toolUseData *uctypes.UIMessageDataToolUse) string {
			parsed, err := parseReadDirInput(input)
			if err != nil {
				return fmt.Sprintf("error parsing input: %v", err)
			}

			readFullDir := false
			if output != nil {
				if outputMap, ok := output.(map[string]any); ok {
					_, wasTruncated := outputMap["truncated"]
					readFullDir = !wasTruncated
				}
			}

			if readFullDir {
				return fmt.Sprintf("чтение директории %q (вся директория)", parsed.Path)
			}
			return fmt.Sprintf("чтение директории %q (макс. записей: %d)", parsed.Path, *parsed.MaxEntries)
		},
		ToolAnyCallback: readDirCallback,
		ToolApproval: func(input any) string {
			return uctypes.ApprovalNeedsApproval
		},
		ToolVerifyInput: verifyReadDirInput,
	}
}
