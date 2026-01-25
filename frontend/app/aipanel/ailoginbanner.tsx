// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { memo } from "react";
import { createBlock } from "@/store/global";

export const AILoginBanner = memo(() => {
    const handleLogin = () => {
        const blockDef: BlockDef = {
            meta: {
                view: "waveconfig",
            },
        };
        createBlock(blockDef, false, true);
    };

    return (
        <div className="mx-auto max-w-md mt-6">
            <div className="bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/30 rounded-lg p-6 shadow-lg">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <i className="fa fa-lock text-3xl text-accent"></i>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-primary mb-2">
                            Войдите для доступа к Искра AI
                        </h3>
                        <ul className="text-sm text-secondary space-y-1.5 mb-4">
                            <li className="flex items-center gap-2">
                                <i className="fa fa-check text-accent text-xs"></i>
                                <span>Мощные модели Anthropic и Alibaba</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <i className="fa fa-check text-accent text-xs"></i>
                                <span>Доступные цены подписки</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <i className="fa fa-check text-accent text-xs"></i>
                                <span>3 дня бесплатно для новых пользователей</span>
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

AILoginBanner.displayName = "AILoginBanner";
