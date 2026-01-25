// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { memo } from "react";
import { createBlock } from "@/store/global";

export const AILimitReachedBanner = memo(() => {
    const handleLogin = () => {
        const blockDef: BlockDef = {
            meta: {
                view: "waveconfig",
            },
        };
        createBlock(blockDef, false, true);
    };

    return (
        <div className="mx-auto max-w-md my-3 px-2">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <i className="fa fa-exclamation-triangle text-xl text-yellow-500 flex-shrink-0"></i>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white mb-1">
                            Бесплатные запросы исчерпаны (3/3)
                        </p>
                        <p className="text-xs text-gray-400">
                            3 дня бесплатно для новых пользователей
                        </p>
                    </div>
                    <button
                        onClick={handleLogin}
                        className="px-4 py-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded transition-colors flex-shrink-0 cursor-pointer"
                    >
                        Войти
                    </button>
                </div>
            </div>
        </div>
    );
});

AILimitReachedBanner.displayName = "AILimitReachedBanner";
