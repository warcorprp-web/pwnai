// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { Button } from "@/app/element/button";
import { Input } from "@/app/element/input";
import { RpcApi } from "@/app/store/wshclientapi";
import type { WaveConfigViewModel } from "@/app/view/waveconfig/waveconfig-model";
import { cn } from "@/util/util";
import { atom, useAtom, useAtomValue } from "jotai";
import { memo, useEffect, useState } from "react";

interface Connection {
    name: string;
    hostname: string;
    port: string;
    user: string;
    authType: "password" | "key" | "agent";
    passwordSecretName?: string;
    identityFile?: string[];
}

interface ConnectionsContentProps {
    model: WaveConfigViewModel;
}

const EmptyState = memo(({ onAddConnection }: { onAddConnection: () => void }) => {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-12 h-full bg-zinc-800/50 rounded-lg">
            <i className="fa-sharp fa-solid fa-server text-4xl text-zinc-600" />
            <h3 className="text-lg font-semibold text-zinc-400">Нет подключений</h3>
            <p className="text-zinc-500">Добавьте SSH подключение для начала работы</p>
            <button
                className="flex items-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-500 rounded cursor-pointer transition-colors"
                onClick={onAddConnection}
            >
                <i className="fa-sharp fa-solid fa-plus" />
                <span className="font-medium">Добавить подключение</span>
            </button>
        </div>
    );
});
EmptyState.displayName = "EmptyState";

const ConnectionCard = memo(
    ({
        connection,
        onEdit,
        onDelete,
        onConnect,
    }: {
        connection: Connection;
        onEdit: () => void;
        onDelete: () => void;
        onConnect: () => void;
    }) => {
        return (
            <div className="flex items-center gap-4 p-4 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg transition-colors border border-zinc-700/50">
                <div className="flex items-center justify-center w-12 h-12 bg-accent-600/20 rounded-lg">
                    <i className="fa-sharp fa-solid fa-server text-accent-500 text-xl" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-semibold text-zinc-200 truncate">{connection.name}</div>
                    <div className="text-sm text-zinc-400 truncate">
                        {connection.user}@{connection.hostname}:{connection.port}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-zinc-700 rounded text-zinc-400">
                            {connection.authType === "password"
                                ? "Пароль"
                                : connection.authType === "key"
                                ? "SSH ключ"
                                : "SSH Agent"}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onConnect}
                        className="px-3 py-2 bg-accent-600 hover:bg-accent-500 rounded cursor-pointer transition-colors"
                        title="Подключиться"
                    >
                        <i className="fa-sharp fa-solid fa-plug" />
                    </button>
                    <button
                        onClick={onEdit}
                        className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded cursor-pointer transition-colors"
                        title="Редактировать"
                    >
                        <i className="fa-sharp fa-solid fa-pen" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded cursor-pointer transition-colors"
                        title="Удалить"
                    >
                        <i className="fa-sharp fa-solid fa-trash" />
                    </button>
                </div>
            </div>
        );
    }
);
ConnectionCard.displayName = "ConnectionCard";

const ConnectionForm = memo(
    ({
        connection,
        onSave,
        onCancel,
    }: {
        connection?: Connection;
        onSave: (conn: Connection) => void;
        onCancel: () => void;
    }) => {
        const [name, setName] = useState(connection?.name || "");
        const [hostname, setHostname] = useState(connection?.hostname || "");
        const [port, setPort] = useState(connection?.port || "22");
        const [user, setUser] = useState(connection?.user || "");
        const [authType, setAuthType] = useState<"password" | "key" | "agent">(connection?.authType || "password");
        const [password, setPassword] = useState("");
        const [identityFile, setIdentityFile] = useState(connection?.identityFile?.[0] || "");

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSave({
                name,
                hostname,
                port,
                user,
                authType,
                passwordSecretName: authType === "password" ? `SSH_PASSWORD_${name}` : undefined,
                identityFile: authType === "key" && identityFile ? [identityFile] : undefined,
            });
        };

        return (
            <div className="flex flex-col gap-4 p-6 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-zinc-200">
                        {connection ? "Редактировать подключение" : "Новое подключение"}
                    </h3>
                    <button
                        onClick={onCancel}
                        className="px-3 py-1 hover:bg-zinc-700 rounded cursor-pointer transition-colors"
                    >
                        <i className="fa-sharp fa-solid fa-xmark" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Название</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 focus:outline-none focus:border-accent-500"
                            placeholder="my-server"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Хост</label>
                            <input
                                type="text"
                                value={hostname}
                                onChange={(e) => setHostname(e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 focus:outline-none focus:border-accent-500"
                                placeholder="example.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Порт</label>
                            <input
                                type="text"
                                value={port}
                                onChange={(e) => setPort(e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 focus:outline-none focus:border-accent-500"
                                placeholder="22"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Пользователь</label>
                        <input
                            type="text"
                            value={user}
                            onChange={(e) => setUser(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 focus:outline-none focus:border-accent-500"
                            placeholder="root"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Аутентификация</label>
                        <div className="flex gap-2">
                            {(["password", "key", "agent"] as const).map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setAuthType(type)}
                                    className={cn(
                                        "flex-1 px-3 py-2 rounded cursor-pointer transition-colors",
                                        authType === type
                                            ? "bg-accent-600 text-white"
                                            : "bg-zinc-700 text-zinc-400 hover:bg-zinc-600"
                                    )}
                                >
                                    {type === "password" ? "Пароль" : type === "key" ? "SSH ключ" : "SSH Agent"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {authType === "password" && (
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Пароль</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 focus:outline-none focus:border-accent-500"
                                placeholder="••••••••"
                            />
                            <p className="text-xs text-zinc-500 mt-1">Пароль будет сохранён в зашифрованном виде</p>
                        </div>
                    )}

                    {authType === "key" && (
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Путь к ключу</label>
                            <input
                                type="text"
                                value={identityFile}
                                onChange={(e) => setIdentityFile(e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 focus:outline-none focus:border-accent-500"
                                placeholder="~/.ssh/id_rsa"
                            />
                        </div>
                    )}

                    <div className="flex gap-2 pt-2">
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-accent-600 hover:bg-accent-500 rounded cursor-pointer transition-colors font-medium"
                        >
                            Сохранить
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded cursor-pointer transition-colors"
                        >
                            Отмена
                        </button>
                    </div>
                </form>
            </div>
        );
    }
);
ConnectionForm.displayName = "ConnectionForm";

export const ConnectionsContent = memo(({ model }: ConnectionsContentProps) => {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingConnection, setEditingConnection] = useState<Connection | undefined>();

    useEffect(() => {
        loadConnections();
    }, []);

    const loadConnections = async () => {
        try {
            setLoading(true);
            const data = await RpcApi.ConfigGetCommand("connections.json");
            const conns: Connection[] = [];

            if (data && typeof data === "object") {
                for (const [name, config] of Object.entries(data)) {
                    if (typeof config === "object" && config !== null) {
                        conns.push({
                            name,
                            hostname: (config as any)["ssh:hostname"] || "",
                            port: (config as any)["ssh:port"] || "22",
                            user: (config as any)["ssh:user"] || "",
                            authType: (config as any)["ssh:passwordsecretname"]
                                ? "password"
                                : (config as any)["ssh:identityfile"]
                                ? "key"
                                : "agent",
                            passwordSecretName: (config as any)["ssh:passwordsecretname"],
                            identityFile: (config as any)["ssh:identityfile"],
                        });
                    }
                }
            }

            setConnections(conns);
        } catch (error) {
            console.error("Failed to load connections:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveConnection = async (conn: Connection) => {
        try {
            // Загружаем текущий конфиг
            const currentData = (await RpcApi.ConfigGetCommand("connections.json")) || {};

            // Формируем данные подключения
            const connData: any = {
                "ssh:hostname": conn.hostname,
                "ssh:port": conn.port,
                "ssh:user": conn.user,
            };

            if (conn.authType === "password" && conn.passwordSecretName) {
                connData["ssh:passwordsecretname"] = conn.passwordSecretName;
                // TODO: Сохранить пароль в secrets через RpcApi.SetSecretsCommand
            } else if (conn.authType === "key" && conn.identityFile) {
                connData["ssh:identityfile"] = conn.identityFile;
            }

            // Обновляем конфиг
            const newData = { ...currentData, [conn.name]: connData };
            await RpcApi.ConfigSetCommand("connections.json", newData);

            // Перезагружаем список
            await loadConnections();
            setShowForm(false);
            setEditingConnection(undefined);
        } catch (error) {
            console.error("Failed to save connection:", error);
        }
    };

    const handleDeleteConnection = async (name: string) => {
        if (!confirm(`Удалить подключение "${name}"?`)) return;

        try {
            const currentData = (await RpcApi.ConfigGetCommand("connections.json")) || {};
            delete currentData[name];
            await RpcApi.ConfigSetCommand("connections.json", currentData);
            await loadConnections();
        } catch (error) {
            console.error("Failed to delete connection:", error);
        }
    };

    const handleConnect = async (conn: Connection) => {
        // TODO: Открыть новый терминал с подключением
        console.log("Connect to:", conn.name);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <i className="fa-sharp fa-solid fa-spinner fa-spin text-2xl text-zinc-400" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full p-6 gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-zinc-200">SSH Подключения</h2>
                    <p className="text-sm text-zinc-400 mt-1">Управление SSH подключениями к серверам</p>
                </div>
                {!showForm && connections.length > 0 && (
                    <button
                        onClick={() => {
                            setEditingConnection(undefined);
                            setShowForm(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-500 rounded cursor-pointer transition-colors"
                    >
                        <i className="fa-sharp fa-solid fa-plus" />
                        <span className="font-medium">Добавить</span>
                    </button>
                )}
            </div>

            {showForm && (
                <ConnectionForm
                    connection={editingConnection}
                    onSave={handleSaveConnection}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingConnection(undefined);
                    }}
                />
            )}

            {!showForm && connections.length === 0 && (
                <EmptyState
                    onAddConnection={() => {
                        setEditingConnection(undefined);
                        setShowForm(true);
                    }}
                />
            )}

            {!showForm && connections.length > 0 && (
                <div className="flex flex-col gap-3 overflow-y-auto">
                    {connections.map((conn) => (
                        <ConnectionCard
                            key={conn.name}
                            connection={conn}
                            onEdit={() => {
                                setEditingConnection(conn);
                                setShowForm(true);
                            }}
                            onDelete={() => handleDeleteConnection(conn.name)}
                            onConnect={() => handleConnect(conn)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
});
ConnectionsContent.displayName = "ConnectionsContent";
