// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { atoms, isDev, pushNotification } from "@/store/global";
import { useAtomValue } from "jotai";
import { useEffect } from "react";

export const useUpdateNotifier = () => {
    const appUpdateStatus = useAtomValue(atoms.updaterStatusAtom);

    useEffect(() => {
        let notification: NotificationType | null = null;

        switch (appUpdateStatus) {
            case "ready":
                notification = {
                    id: "update-notification",
                    icon: "arrows-rotate",
                    title: "Update Available",
                    message: "Доступно новое обновление, готовое к установке.",
                    timestamp: new Date().toLocaleString(),
                    type: "update",
                    actions: [
                        {
                            label: "Установить сейчас",
                            actionKey: "installUpdate",
                            color: "green",
                            disabled: false,
                        },
                    ],
                };
                break;

            case "downloading":
                notification = {
                    id: "update-notification",
                    icon: "arrows-rotate",
                    title: "Загрузка обновления",
                    message: "Обновление загружается.",
                    timestamp: new Date().toLocaleString(),
                    type: "update",
                    actions: [
                        {
                            label: "Загрузка...",
                            actionKey: "",
                            color: "green",
                            disabled: true,
                        },
                    ],
                };
                break;

            case "installing":
                notification = {
                    id: "update-notification",
                    icon: "arrows-rotate",
                    title: "Установка обновления",
                    message: "Обновление устанавливается.",
                    timestamp: new Date().toLocaleString(),
                    type: "update",
                    actions: [
                        {
                            label: "Установка...",
                            actionKey: "",
                            color: "green",
                            disabled: true,
                        },
                    ],
                };
                break;

            case "error":
                notification = {
                    id: "update-notification",
                    icon: "circle-exclamation",
                    title: "Ошибка обновления",
                    message: "Произошла ошибка в процессе обновления.",
                    timestamp: new Date().toLocaleString(),
                    type: "update",
                    actions: [
                        {
                            label: "Повторить обновление",
                            actionKey: "retryUpdate",
                            color: "green",
                            disabled: false,
                        },
                    ],
                };
                break;
        }

        if (!isDev()) return;

        if (notification) {
            pushNotification(notification);
        }
    }, [appUpdateStatus]);
};
