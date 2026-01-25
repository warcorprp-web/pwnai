// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { formatFileSizeError, isAcceptableFile, validateFileSize } from "@/app/aipanel/ai-utils";
import { waveAIHasFocusWithin } from "@/app/aipanel/waveai-focus-utils";
import { type WaveAIModel } from "@/app/aipanel/waveai-model";
import { Tooltip } from "@/element/tooltip";
import { modalsModel } from "@/app/store/modalmodel";
import { cn } from "@/util/util";
import { useAtom, useAtomValue } from "jotai";
import { memo, useCallback, useEffect, useRef, useState } from "react";

interface AIPanelInputProps {
    onSubmit: (e: React.FormEvent) => void;
    status: string;
    model: WaveAIModel;
}

export interface AIPanelInputRef {
    focus: () => void;
    resize: () => void;
    scrollToBottom: () => void;
}

export const AIPanelInput = memo(({ onSubmit, status, model }: AIPanelInputProps) => {
    const [input, setInput] = useAtom(model.inputAtom);
    const isFocused = useAtomValue(model.isWaveAIFocusedAtom);
    const isChatEmpty = useAtomValue(model.isChatEmptyAtom);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isPanelOpen = useAtomValue(model.getPanelVisibleAtom());
    const [showLoginOverlay, setShowLoginOverlay] = useState(false);
    
    // TODO: Заменить на реальную проверку авторизации
    const isAuthenticated = false;

    let placeholder: string;
    if (!isChatEmpty) {
        placeholder = "Продолжить...";
    } else if (model.inBuilder) {
        placeholder = "Что вы хотите создать...";
    } else {
        placeholder = "Спросите что угодно...";
    }
    
    const handleLogin = () => {
        modalsModel.pushModal("SettingsModal", { initialTab: "general" });
    };

    const resizeTextarea = useCallback(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.style.height = "auto";
        const scrollHeight = textarea.scrollHeight;
        const maxHeight = 7 * 24;
        textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }, []);

    useEffect(() => {
        const inputRefObject: React.RefObject<AIPanelInputRef> = {
            current: {
                focus: () => {
                    textareaRef.current?.focus();
                },
                resize: resizeTextarea,
                scrollToBottom: () => {
                    const textarea = textareaRef.current;
                    if (textarea) {
                        textarea.scrollTop = textarea.scrollHeight;
                    }
                },
            },
        };
        model.registerInputRef(inputRefObject);
    }, [model, resizeTextarea]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const isComposing = e.nativeEvent?.isComposing || e.keyCode == 229;
        if (e.key === "Enter" && !e.shiftKey && !isComposing) {
            e.preventDefault();
            onSubmit(e as any);
        }
    };

    const handleFocus = useCallback(() => {
        model.requestWaveAIFocus();
    }, [model]);

    const handleBlur = useCallback(
        (e: React.FocusEvent) => {
            if (e.relatedTarget === null) {
                return;
            }

            if (waveAIHasFocusWithin(e.relatedTarget)) {
                return;
            }

            model.requestNodeFocus();
        },
        [model]
    );

    useEffect(() => {
        resizeTextarea();
    }, [input, resizeTextarea]);

    useEffect(() => {
        if (isPanelOpen) {
            resizeTextarea();
        }
    }, [isPanelOpen, resizeTextarea]);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const acceptableFiles = files.filter(isAcceptableFile);

        for (const file of acceptableFiles) {
            const sizeError = validateFileSize(file);
            if (sizeError) {
                model.setError(formatFileSizeError(sizeError));
                if (e.target) {
                    e.target.value = "";
                }
                return;
            }
            await model.addFile(file);
        }

        if (acceptableFiles.length < files.length) {
            console.warn(`${files.length - acceptableFiles.length} files were rejected due to unsupported file types`);
        }

        if (e.target) {
            e.target.value = "";
        }
    };

    return (
        <div className={cn("px-3 pb-3 pt-2")}>
            <div className={cn(
                "border rounded-xl transition-all",
                isFocused ? "border-accent/50 shadow-lg shadow-accent/10" : "border-gray-600"
            )}>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.txt,.md,.js,.jsx,.ts,.tsx,.go,.py,.java,.c,.cpp,.h,.hpp,.html,.css,.scss,.sass,.json,.xml,.yaml,.yml,.sh,.bat,.sql"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <form onSubmit={onSubmit}>
                    <div className="relative">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            placeholder={placeholder}
                            className={cn(
                                "w-full text-white px-4 py-3 pr-24 focus:outline-none resize-none overflow-auto bg-transparent"
                            )}
                            style={{ fontSize: "14px", minHeight: "52px" }}
                            rows={2}
                        />
                        <div className="absolute bottom-2.5 right-2 flex gap-1.5">
                            <Tooltip content="Прикрепить файлы" placement="top">
                                <button
                                    type="button"
                                    onClick={handleUploadClick}
                                    className={cn(
                                        "w-8 h-8 rounded-lg transition-all flex items-center justify-center",
                                        "text-gray-400 hover:text-accent hover:bg-accent/10 cursor-pointer"
                                    )}
                                >
                                    <i className="fa fa-paperclip text-sm"></i>
                                </button>
                            </Tooltip>
                            {status === "streaming" ? (
                                <Tooltip content="Остановить ответ" placement="top">
                                    <button
                                        type="button"
                                        onClick={() => model.stopResponse()}
                                        className={cn(
                                            "w-8 h-8 rounded-lg transition-all flex items-center justify-center",
                                            "bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 cursor-pointer"
                                        )}
                                    >
                                        <i className="fa fa-square text-sm"></i>
                                    </button>
                                </Tooltip>
                            ) : (
                                <Tooltip content="Отправить сообщение (Enter)" placement="top">
                                    <button
                                        type="submit"
                                        disabled={status !== "ready" || !input.trim()}
                                        className={cn(
                                            "w-8 h-8 rounded-lg transition-all flex items-center justify-center",
                                            status !== "ready" || !input.trim()
                                                ? "text-gray-500 bg-gray-700/30 cursor-not-allowed"
                                                : "bg-accent/20 text-accent hover:bg-accent/30 cursor-pointer"
                                        )}
                                    >
                                        <i className="fa fa-paper-plane text-sm"></i>
                                    </button>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                </form>
                
                {/* Login overlay */}
                {!isAuthenticated && (
                    <div 
                        className="absolute inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center rounded-lg cursor-pointer transition-all"
                        onClick={handleLogin}
                        onMouseEnter={() => setShowLoginOverlay(true)}
                        onMouseLeave={() => setShowLoginOverlay(false)}
                    >
                        <div className={cn(
                            "bg-zinc-800/95 border border-accent/30 rounded-lg p-4 shadow-xl transition-all",
                            showLoginOverlay ? "scale-100 opacity-100" : "scale-95 opacity-90"
                        )}>
                            <div className="flex items-center gap-3">
                                <i className="fa fa-lock text-2xl text-accent"></i>
                                <div>
                                    <div className="text-sm font-semibold text-white mb-1">
                                        Требуется авторизация
                                    </div>
                                    <div className="text-xs text-gray-400 mb-2">
                                        3 дня бесплатно для новых пользователей
                                    </div>
                                    <button
                                        onClick={handleLogin}
                                        className="px-3 py-1.5 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded transition-colors"
                                    >
                                        Войти
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

AIPanelInput.displayName = "AIPanelInput";
