// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { Button } from "@/app/element/button";
import { Input } from "@/app/element/input";
import type { WaveConfigViewModel } from "@/app/view/waveconfig/waveconfig-model";
import { useAtomValue } from "jotai";
import { memo, useState } from "react";

interface SettingsContentProps {
    model: WaveConfigViewModel;
}

const SettingsContentComponent = ({ model }: SettingsContentProps) => {
    const fileContent = useAtomValue(model.fileContentAtom);
    const [settings, setSettings] = useState(() => {
        try {
            return JSON.parse(fileContent || "{}");
        } catch {
            return {};
        }
    });

    const handleSave = () => {
        const newContent = JSON.stringify(settings, null, 2);
        model.setFileContent(newContent);
        model.markAsEdited();
        model.saveFile();
    };

    const updateSetting = (key: string, value: any) => {
        setSettings({ ...settings, [key]: value });
    };

    return (
        <div className="flex flex-col h-full overflow-auto p-6 gap-6">
            <div className="max-w-2xl">
                <h2 className="text-xl font-semibold mb-4 text-primary">Настройки профиля</h2>
                
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-secondary">Имя пользователя</label>
                        <Input
                            value={settings["ai:name"] || ""}
                            onChange={(e) => updateSetting("ai:name", e.target.value)}
                            placeholder="Введите ваше имя"
                            className="bg-background border-border"
                        />
                        <span className="text-xs text-muted">Имя, которое будет использоваться в AI чате</span>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-secondary">Язык интерфейса</label>
                        <select
                            value={settings["app:lang"] || "ru"}
                            onChange={(e) => updateSetting("app:lang", e.target.value)}
                            className="px-3 py-2 bg-background border border-border rounded text-primary"
                        >
                            <option value="ru">Русский</option>
                            <option value="en">English</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-secondary">Тема оформления</label>
                        <select
                            value={settings["app:theme"] || "dark"}
                            onChange={(e) => updateSetting("app:theme", e.target.value)}
                            className="px-3 py-2 bg-background border border-border rounded text-primary"
                        >
                            <option value="dark">Тёмная</option>
                            <option value="light">Светлая</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="checkbox"
                            checked={settings["telemetry:enabled"] !== false}
                            onChange={(e) => updateSetting("telemetry:enabled", e.target.checked)}
                            className="w-4 h-4"
                        />
                        <label className="text-sm text-secondary">Отправлять анонимную телеметрию</label>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <Button onClick={handleSave} className="bg-accent hover:bg-accenthover">
                            Сохранить изменения
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const SettingsContent = memo(SettingsContentComponent);
