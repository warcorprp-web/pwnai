// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

// PwnAI Chat Hook - замена useChat для PwnAI backend

import { PwnAIClient } from "@/app/store/pwnai-client";
import { WaveUIMessage } from "./aitypes";
import { useCallback, useEffect, useRef, useState } from "react";

export type ChatStatus = "ready" | "streaming" | "error";

export interface UsePwnAIChatOptions {
    onError?: (error: string) => void;
    onToolCall?: (toolCall: any) => Promise<any>;
}

export interface UsePwnAIChatReturn {
    messages: WaveUIMessage[];
    sendMessage: (message: string) => Promise<void>;
    status: ChatStatus;
    setMessages: (messages: WaveUIMessage[]) => void;
    error: string | null;
    stop: () => void;
}

export function usePwnAIChat(options: UsePwnAIChatOptions = {}): UsePwnAIChatReturn {
    const [messages, setMessages] = useState<WaveUIMessage[]>([]);
    const [status, setStatus] = useState<ChatStatus>("ready");
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const stop = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setStatus("ready");
        }
    }, []);

    const sendMessage = useCallback(
        async (content: string) => {
            if (status === "streaming") {
                console.warn("Already streaming, ignoring new message");
                return;
            }

            // Добавляем сообщение пользователя
            const userMessage: WaveUIMessage = {
                id: `user-${Date.now()}`,
                role: "user",
                content: content,
                parts: [{ type: "text", text: content }],
            };

            setMessages((prev) => [...prev, userMessage]);
            setStatus("streaming");
            setError(null);

            // Создаём AbortController для возможности остановки
            abortControllerRef.current = new AbortController();

            try {
                // Подготавливаем сообщения для AI
                const aiMessages = [...messages, userMessage].map((msg) => ({
                    role: msg.role,
                    content: msg.content || "",
                    parts: msg.parts,
                }));

                let assistantMessage: WaveUIMessage = {
                    id: `assistant-${Date.now()}`,
                    role: "assistant",
                    content: "",
                    parts: [],
                };

                let isFirstChunk = true;

                // Стримим ответ от AI
                await PwnAIClient.streamAI(
                    aiMessages,
                    async (packet) => {
                        if (abortControllerRef.current?.signal.aborted) {
                            return;
                        }

                        if (packet.type === "text") {
                            // Текстовый ответ
                            assistantMessage.content += packet.text || "";
                            assistantMessage.parts.push({
                                type: "text",
                                text: packet.text || "",
                            });

                            if (isFirstChunk) {
                                setMessages((prev) => [...prev, assistantMessage]);
                                isFirstChunk = false;
                            } else {
                                setMessages((prev) => {
                                    const newMessages = [...prev];
                                    newMessages[newMessages.length - 1] = { ...assistantMessage };
                                    return newMessages;
                                });
                            }
                        } else if (packet.type === "tool_use" && packet.toolCall) {
                            // AI хочет вызвать инструмент
                            console.log("🔧 Tool call:", packet.toolCall);

                            // Добавляем tool_use в сообщение
                            assistantMessage.parts.push({
                                type: "tool_use",
                                id: packet.toolCall.id,
                                name: packet.toolCall.name,
                                input: JSON.parse(packet.toolCall.args),
                            });

                            if (isFirstChunk) {
                                setMessages((prev) => [...prev, assistantMessage]);
                                isFirstChunk = false;
                            } else {
                                setMessages((prev) => {
                                    const newMessages = [...prev];
                                    newMessages[newMessages.length - 1] = { ...assistantMessage };
                                    return newMessages;
                                });
                            }

                            // Выполняем инструмент если есть обработчик
                            if (options.onToolCall) {
                                try {
                                    const toolResult = await options.onToolCall(packet.toolCall);

                                    // Добавляем результат инструмента
                                    const toolResultMessage: WaveUIMessage = {
                                        id: `tool-result-${Date.now()}`,
                                        role: "user",
                                        content: "",
                                        parts: [
                                            {
                                                type: "tool_result",
                                                tool_use_id: packet.toolCall.id,
                                                content: JSON.stringify(toolResult),
                                            },
                                        ],
                                    };

                                    setMessages((prev) => [...prev, toolResultMessage]);

                                    // Продолжаем диалог с результатом
                                    // Рекурсивно вызываем sendMessage с пустым контентом
                                    // чтобы AI обработал результат
                                    setTimeout(() => {
                                        sendMessage("");
                                    }, 100);
                                } catch (err) {
                                    console.error("Tool execution error:", err);
                                    setError(`Ошибка выполнения инструмента: ${err.message}`);
                                }
                            }
                        }
                    },
                    () => {
                        // Завершено
                        setStatus("ready");
                        abortControllerRef.current = null;
                    },
                    (errorMsg) => {
                        // Ошибка
                        console.error("AI Stream error:", errorMsg);
                        setError(errorMsg);
                        setStatus("error");
                        abortControllerRef.current = null;

                        if (options.onError) {
                            options.onError(errorMsg);
                        }
                    }
                );
            } catch (err) {
                console.error("Send message error:", err);
                setError(err.message || "Unknown error");
                setStatus("error");
                abortControllerRef.current = null;

                if (options.onError) {
                    options.onError(err.message);
                }
            }
        },
        [messages, status, options]
    );

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return {
        messages,
        sendMessage,
        status,
        setMessages,
        error,
        stop,
    };
}
