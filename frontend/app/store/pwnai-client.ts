// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

// PwnAI RPC Client для вызова pentest команд и AI интеграции

import { RpcApi } from "@/app/store/wshclientapi";

export interface ScanResult {
    target: string;
    scan_type: string;
    output: string;
    timestamp: string;
}

export interface ExploitResult {
    success: boolean;
    session_id?: number;
    target: string;
    exploit: string;
    message: string;
}

export interface AIMessage {
    role: "user" | "assistant";
    content: string;
    parts?: any[];
}

export interface AIStreamPacket {
    type: "text" | "tool_use" | "done" | "error";
    text?: string;
    toolCall?: {
        id: string;
        name: string;
        args: string;
    };
    error?: string;
}

export class PwnAIClient {
    // Сканирование цели
    static async scanTarget(target: string, scanType: string = "quick"): Promise<ScanResult> {
        return await RpcApi.PentestScanCommand({ target, scanType });
    }

    // Эксплуатация уязвимости
    static async exploitTarget(
        target: string,
        exploit: string,
        port: number = 445,
        lhost?: string
    ): Promise<ExploitResult> {
        return await RpcApi.PentestExploitCommand({ target, exploit, port, lhost });
    }

    // Список сессий
    static async listSessions(): Promise<Record<string, any>> {
        return await RpcApi.PentestSessionsCommand({});
    }

    // Выполнить команду в сессии
    static async runSessionCommand(sessionId: number, command: string): Promise<any> {
        return await RpcApi.PentestCommandCommand({ sessionId, command });
    }

    // Прямой вызов MSF RPC
    static async msfRpcCall(method: string, params: any[] = []): Promise<any> {
        return await RpcApi.PentestMsfRpcCommand({ method, params });
    }

    // AI Streaming
    static async streamAI(
        messages: AIMessage[],
        onPacket: (packet: AIStreamPacket) => void,
        onComplete: () => void,
        onError: (error: string) => void
    ): Promise<void> {
        try {
            const stream = RpcApi.PentestAIStreamCommand({ messages });

            for await (const packet of stream) {
                if (packet.error) {
                    onError(packet.error);
                    return;
                }

                if (packet.response) {
                    onPacket(packet.response as AIStreamPacket);

                    if (packet.response.type === "done") {
                        onComplete();
                        return;
                    }
                }
            }
        } catch (error) {
            onError(error.message || "Unknown error");
        }
    }

    // Выполнение tool result
    static async executeToolResult(toolCallId: string, toolName: string, params: any): Promise<any> {
        return await RpcApi.PentestToolResultCommand({
            toolCallId,
            toolName,
            params,
        });
    }
}
