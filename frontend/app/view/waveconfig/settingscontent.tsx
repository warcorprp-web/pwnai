// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { Button } from "@/app/element/button";
import type { WaveConfigViewModel } from "@/app/view/waveconfig/waveconfig-model";
import { isAuthenticatedAtom } from "@/app/store/authstate";
import { useAtom } from "jotai";
import { memo, useState } from "react";

interface SettingsContentProps {
    model: WaveConfigViewModel;
}

const SettingsContentComponent = ({ model }: SettingsContentProps) => {
    const [isAuthenticated, setIsAuthenticated] = useAtom(isAuthenticatedAtom);
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (!email || !password) {
            setError("Заполните все поля");
            return;
        }
        
        if (!isLogin && password !== confirmPassword) {
            setError("Пароли не совпадают");
            return;
        }
        
        setLoading(true);
        
        try {
            // TODO: Реальный API запрос к backend
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Временно: просто авторизуем
            setIsAuthenticated(true);
            setError("");
        } catch (err) {
            setError("Ошибка авторизации. Попробуйте снова.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
    };

    if (isAuthenticated) {
        return (
            <div className="flex flex-col h-full overflow-auto p-6">
                <div className="max-w-md mx-auto w-full">
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                                <i className="fa fa-user text-accent text-xl"></i>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">{email || "Пользователь"}</h3>
                                <p className="text-sm text-gray-400">Активная подписка</p>
                            </div>
                        </div>
                        
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between py-2 border-b border-zinc-700">
                                <span className="text-gray-400">Подписка</span>
                                <span className="text-white font-medium">Pro</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-zinc-700">
                                <span className="text-gray-400">Действует до</span>
                                <span className="text-white">01.02.2026</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-gray-400">Запросов сегодня</span>
                                <span className="text-white">45 / 1000</span>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <button className="w-full px-4 py-2.5 bg-accent/20 hover:bg-accent/30 text-accent font-medium rounded transition-colors cursor-pointer">
                                Управление подпиской
                            </button>
                            <button 
                                onClick={handleLogout}
                                className="w-full px-4 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded transition-colors cursor-pointer"
                            >
                                Выйти
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-auto p-6">
            <div className="max-w-md mx-auto w-full">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {isLogin ? "Вход в Искра AI" : "Регистрация"}
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {isLogin 
                            ? "Войдите, чтобы продолжить использование" 
                            : "3 дня бесплатно для новых пользователей"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Пароль
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                            disabled={loading}
                        />
                    </div>

                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Подтвердите пароль
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                                disabled={loading}
                            />
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-3 bg-accent hover:bg-accent/90 disabled:bg-accent/50 text-white font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                        {loading ? "Загрузка..." : isLogin ? "Войти" : "Зарегистрироваться"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError("");
                        }}
                        className="text-accent hover:text-accent/80 text-sm cursor-pointer"
                    >
                        {isLogin ? "Нет аккаунта? Зарегистрируйтесь" : "Уже есть аккаунт? Войдите"}
                    </button>
                </div>

                {isLogin && (
                    <div className="mt-3 text-center">
                        <button className="text-gray-400 hover:text-gray-300 text-sm cursor-pointer">
                            Забыли пароль?
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export const SettingsContent = memo(SettingsContentComponent);
