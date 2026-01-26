// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { Button } from "@/app/element/button";
import { Input } from "@/app/element/input";
import { RpcApi } from "@/app/store/wshclientapi";
import { TabRpcClient } from "@/app/store/wshrpcutil";
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
        onSave: (conn: Connection, password?: string) => Promise<void>;
        onCancel: () => void;
    }) => {
        const [name, setName] = useState(connection?.name || "");
        const [hostname, setHostname] = useState(connection?.hostname || "");
        const [port, setPort] = useState(connection?.port || "22");
        const [user, setUser] = useState(connection?.user || "");
        const [authType, setAuthType] = useState<"password" | "key" | "agent">(connection?.authType || "password");
        const [password, setPassword] = useState("");
        const [identityFile, setIdentityFile] = useState(connection?.identityFile?.[0] || "");
        const [saving, setSaving] = useState(false);

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setSaving(true);
            try {
                await onSave(
                    {
                        name,
                        hostname,
                        port,
                        user,
                        authType,
                        passwordSecretName: authType === "password" ? `SSH_PASSWORD_${name}` : undefined,
                        identityFile: authType === "key" && identityFile ? [identityFile] : undefined,
                    },
                    authType === "password" ? password : undefined
                );
            } finally {
                setSaving(false);
            }
        };

        return (
            <div className="max-w-lg mx-auto bg-zinc-800/50 rounded-lg border border-zinc-700/50 p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-zinc-200">
                        {connection ? "Редактировать" : "Новое подключение"}
                    </h3>
                    <button
                        onClick={onCancel}
                        className="w-8 h-8 flex items-center justify-center hover:bg-zinc-700 rounded transition-colors"
                    >
                        <i className="fa-sharp fa-solid fa-xmark" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Название */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-2">Название</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-sm focus:outline-none focus:border-accent-500"
                            placeholder="my-server"
                            required
                        />
                    </div>

                    {/* Пользователь */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-2">Пользователь</label>
                        <input
                            type="text"
                            value={user}
                            onChange={(e) => setUser(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-sm focus:outline-none focus:border-accent-500"
                            placeholder="root"
                            required
                        />
                    </div>

                    {/* Хост и Порт */}
                    <div className="grid grid-cols-[1fr_100px] gap-3">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-2">Хост</label>
                            <input
                                type="text"
                                value={hostname}
                                onChange={(e) => setHostname(e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-sm focus:outline-none focus:border-accent-500"
                                placeholder="example.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-2">Порт</label>
                            <input
                                type="text"
                                value={port}
                                onChange={(e) => setPort(e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-sm text-center focus:outline-none focus:border-accent-500"
                                placeholder="22"
                                required
                            />
                        </div>
                    </div>

                    {/* Аутентификация */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-2">Аутентификация</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setAuthType("password")}
                                className={cn(
                                    "px-3 py-2 text-xs rounded transition-colors",
                                    authType === "password"
                                        ? "bg-accent-600 text-white"
                                        : "bg-zinc-700 text-zinc-400 hover:bg-zinc-600"
                                )}
                            >
                                Пароль
                            </button>
                            <button
                                type="button"
                                onClick={() => setAuthType("key")}
                                className={cn(
                                    "px-3 py-2 text-xs rounded transition-colors",
                                    authType === "key"
                                        ? "bg-accent-600 text-white"
                                        : "bg-zinc-700 text-zinc-400 hover:bg-zinc-600"
                                )}
                            >
                                Ключ
                            </button>
                            <button
                                type="button"
                                onClick={() => setAuthType("agent")}
                                className={cn(
                                    "px-3 py-2 text-xs rounded transition-colors",
                                    authType === "agent"
                                        ? "bg-accent-600 text-white"
                                        : "bg-zinc-700 text-zinc-400 hover:bg-zinc-600"
                                )}
                            >
                                Agent
                            </button>
                        </div>
                    </div>

                    {/* Пароль */}
                    {authType === "password" && (
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-2">Пароль</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-sm focus:outline-none focus:border-accent-500"
                                placeholder="••••••••"
                            />
                        </div>
                    )}

                    {/* Путь к ключу */}
                    {authType === "key" && (
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-2">Путь к ключу</label>
                            <input
                                type="text"
                                value={identityFile}
                                onChange={(e) => setIdentityFile(e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-sm focus:outline-none focus:border-accent-500"
                                placeholder="~/.ssh/id_rsa"
                            />
                        </div>
                    )}

                    {/* Кнопки */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-4 py-2.5 text-sm bg-accent-600 hover:bg-accent-500 disabled:bg-accent-600/50 disabled:cursor-not-allowed rounded transition-colors font-medium"
                        >
                            {saving ? (
                                <>
                                    <i className="fa-sharp fa-solid fa-spinner fa-spin mr-2" />
                                    Сохранение...
                                </>
                            ) : (
                                "Сохранить"
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={saving}
                            className="px-4 py-2.5 text-sm bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-700/50 disabled:cursor-not-allowed rounded transition-colors"
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
            const fullConfig = await RpcApi.GetFullConfigCommand(TabRpcClient);
            const connectionsData = fullConfig?.connections || {};
            const conns: Connection[] = [];

            for (const [name, config] of Object.entries(connectionsData)) {
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

            setConnections(conns);
        } catch (error) {
            console.error("Failed to load connections:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveConnection = async (conn: Connection, password?: string) => {
        try {
            console.log("Saving connection:", conn);
            
            // Формируем данные подключения
            const connData: any = {
                "ssh:hostname": conn.hostname,
                "ssh:port": conn.port,
                "ssh:user": conn.user,
            };

            if (conn.authType === "password" && conn.passwordSecretName) {
                connData["ssh:passwordsecretname"] = conn.passwordSecretName;
                // Сохраняем пароль в secrets
                if (password) {
                    console.log("Saving password to secrets");
                    await RpcApi.SetSecretsCommand(TabRpcClient, { [conn.passwordSecretName]: password });
                }
            } else if (conn.authType === "key" && conn.identityFile) {
                connData["ssh:identityfile"] = conn.identityFile;
            }

            // Сохраняем через SetConnectionsConfigCommand
            console.log("Saving config:", connData);
            await RpcApi.SetConnectionsConfigCommand(TabRpcClient, {
                host: conn.name,
                metamaptype: connData
            });

            // Перезагружаем список
            await loadConnections();
            setShowForm(false);
            setEditingConnection(undefined);
            console.log("Connection saved successfully");
        } catch (error) {
            console.error("Failed to save connection:", error);
            alert("Ошибка сохранения: " + error);
        }
    };

    const handleDeleteConnection = async (name: string) => {
        if (!confirm(`Удалить подключение "${name}"?`)) return;

        try {
            // Удаляем через SetConnectionsConfigCommand с пустым объектом
            await RpcApi.SetConnectionsConfigCommand(TabRpcClient, {
                host: name,
                metamaptype: null
            });
            await loadConnections();
        } catch (error) {
            console.error("Failed to delete connection:", error);
        }
    };

    const handleConnect = async (conn: Connection) => {
        try {
            // Создаём новый блок с терминалом и SSH подключением
            const termBlockDef = {
                meta: {
                    view: "term",
                    controller: "shell",
                    "cmd:cwd": "~",
                    "cmd:runonnewblock": true,
                    "cmd:clearonnewblock": true,
                    "connection": conn.name,
                },
            };
            
            await RpcApi.CreateBlockCommand(termBlockDef);
        } catch (error) {
            console.error("Failed to connect:", error);
        }
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
