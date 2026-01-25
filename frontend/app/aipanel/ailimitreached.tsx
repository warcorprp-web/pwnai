// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { memo } from "react";
import { modalsModel } from "@/app/store/modalmodel";

export const AILimitReachedBanner = memo(() => {
    const handleLogin = () => {
        modalsModel.pushModal("SettingsModal", { initialTab: "general" });
    };

    return (
        <div className="mx-auto max-w-md my-4">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <i className="fa fa-exclamation-triangle text-3xl text-yellow-500"></i>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">
                            Бесплатные запросы исчерпаны (3/3)
                        </h3>
                        <p className="text-sm text-gray-300 mb-4">
                            Войдите, чтобы продолжить использование Искра AI
                        </p>
                        <ul className="text-sm text-gray-400 space-y-1.5 mb-4">
                            <li className="flex items-center gap-2">
                                <i className="fa fa-check text-accent text-xs"></i>
                                <span>3 дня бесплатно для новых пользователей</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <i className="fa fa-check text-accent text-xs"></i>
                                <span>Мощные модели Anthropic и Alibaba</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <i className="fa fa-check text-accent text-xs"></i>
                                <span>Доступные цены подписки</span>
                            </li>
                        </ul>
                        <button
                            onClick={handleLogin}
                            className="w-full px-4 py-2.5 bg-accent hover:bg-accent/90 text-white font-medium rounded-lg transition-colors"
                        >
                            Войти
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

AILimitReachedBanner.displayName = "AILimitReachedBanner";
