// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { Button } from "@/app/element/button";
import type { WaveConfigViewModel } from "@/app/view/waveconfig/waveconfig-model";
import { authTokenAtom, userDataAtom, isAuthenticatedAtom } from "@/app/store/authstate";
import { authApi } from "@/app/store/authapi";
import { RpcApi } from "@/app/store/wshclientapi";
import { TabRpcClient } from "@/app/store/wshrpcutil";
import { useAtom } from "jotai";
import { memo, useState, useEffect } from "react";

interface SettingsContentProps {
    model: WaveConfigViewModel;
}

const SettingsContentComponent = ({ model }: SettingsContentProps) => {
    const [isAuthenticated] = useAtom(isAuthenticatedAtom);
    const [authToken, setAuthToken] = useAtom(authTokenAtom);
    const [userData, setUserData] = useAtom(userDataAtom);
    const [isLogin, setIsLogin] = useState(true);
    const [step, setStep] = useState<"email" | "otp" | "password">("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [keyInfo, setKeyInfo] = useState<any>(null);
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

    // Проверка параметра payment=success в URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('payment') === 'success') {
            setShowPaymentSuccess(true);
            // Убираем параметр из URL
            window.history.replaceState({}, '', window.location.pathname);
            // Перезагружаем данные пользователя
            if (isAuthenticated && authToken) {
                loadKeyInfo();
            }
            // Скрываем уведомление через 5 секунд
            setTimeout(() => setShowPaymentSuccess(false), 5000);
        }
    }, []);

    // Загрузка информации о ключе при авторизации
    useEffect(() => {
        if (isAuthenticated && authToken) {
            loadKeyInfo();
            
            // Автообновление каждые 10 секунд
            const interval = setInterval(() => {
                loadKeyInfo();
            }, 10000);
            
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, authToken]);

    const loadKeyInfo = async () => {
        try {
            const response = await fetch("https://cli.cryptocatslab.ru/api/auth/key-info", {
                headers: {
                    "Authorization": `Bearer ${authToken}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setKeyInfo(data.data);
            }
        } catch (err) {
            console.error("Ошибка загрузки информации о ключе:", err);
        }
    };

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (!email) {
            setError("Введите email");
            return;
        }
        
        setLoading(true);
        
        try {
            const result = await authApi.sendCode(email);
            if (result.success) {
                setStep("otp");
            } else {
                setError(result.error || "Ошибка отправки кода");
            }
        } catch (err) {
            setError("Ошибка отправки кода");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (!email || !password) {
            setError("Заполните все поля");
            return;
        }
        
        setLoading(true);
        
        try {
            const result = await authApi.login(email, password);
            if (result.success && result.token) {
                setAuthToken(result.token);
                setUserData(result.user || null);
                
                // Получаем API ключ из backend
                try {
                    console.log("Получение API ключа для пользователя...");
                    const keyResponse = await fetch("https://cli.cryptocatslab.ru/api/auth/key-info", {
                        headers: {
                            "Authorization": `Bearer ${result.token}`,
                        },
                    });
                    const keyData = await keyResponse.json();
                    console.log("Ответ key-info:", JSON.stringify(keyData, null, 2));
                    
                    if (keyData.success && keyData.data?.apiKey) {
                        console.log("Сохранение ключа в SecretStore:", keyData.data.apiKey);
                        // Сохраняем ключ в secretstore
                        await RpcApi.SetSecretsCommand(TabRpcClient, {
                            "ISKRA_AI_KEY": keyData.data.apiKey
                        });
                        console.log("Ключ успешно сохранен");
                    } else {
                        console.error("API ключ не найден в ответе");
                    }
                } catch (keyError) {
                    console.error("Ошибка получения API ключа:", keyError);
                }
            } else {
                setError(result.error || "Неверный email или пароль");
            }
        } catch (err) {
            setError("Ошибка входа");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        const otpCode = otp.join("");
        if (otpCode.length !== 6) {
            setError("Введите 6-значный код");
            return;
        }
        
        setLoading(true);
        
        try {
            const result = await authApi.verifyCode(email, otpCode);
            if (result.success) {
                setStep("password");
            } else {
                setError(result.error || "Неверный код");
            }
        } catch (err) {
            setError("Ошибка проверки кода");
        } finally {
            setLoading(false);
        }
    };

    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (!password || password.length < 6) {
            setError("Пароль должен быть не менее 6 символов");
            return;
        }
        
        if (password !== confirmPassword) {
            setError("Пароли не совпадают");
            return;
        }
        
        setLoading(true);
        
        try {
            const result = await authApi.register(email, password);
            if (result.success && result.token) {
                setAuthToken(result.token);
                setUserData(result.user || null);
                
                // Сохраняем API ключ в secretstore
                if (result.apiKey) {
                    try {
                        await RpcApi.SetSecretsCommand(TabRpcClient, {
                            "ISKRA_AI_KEY": result.apiKey
                        });
                    } catch (secretError) {
                        console.error("Ошибка сохранения API ключа:", secretError);
                    }
                }
            } else {
                setError(result.error || "Ошибка регистрации");
            }
        } catch (err) {
            setError("Ошибка регистрации");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return;
        if (value && !/^\d$/.test(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        
        // Автофокус на следующее поле
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const resetForm = () => {
        setStep("email");
        setEmail("");
        setOtp(["", "", "", "", "", ""]);
        setPassword("");
        setConfirmPassword("");
        setError("");
    };

    const handleLogout = () => {
        setAuthToken(null);
        setUserData(null);
        resetForm();
    };

    const handleUpgrade = async (plan: "pro" | "pro_plus") => {
        try {
            const response = await fetch("https://cli.cryptocatslab.ru/api/payment/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                },
                body: JSON.stringify({ plan })
            });

            if (!response.ok) throw new Error("Ошибка создания платежа");

            const data = await response.json();
            window.open(data.payment_url, "_blank");
        } catch (err) {
            console.error("Ошибка оплаты:", err);
            setError("Не удалось создать платеж");
        }
    };

    if (isAuthenticated) {
        const subscriptionTier = userData?.subscription_tier || "trial";
        const subscriptionExpires = userData?.subscription_expires 
            ? new Date(userData.subscription_expires).toLocaleDateString("ru-RU")
            : "—";
        const dailyLimit = keyInfo?.dailyLimit || 100;
        const todayUsage = keyInfo?.usage?.today || 0;
        const remaining = keyInfo?.usage?.remaining || dailyLimit;

        return (
            <div className="flex flex-col h-full overflow-auto p-6">
                {/* Уведомление об успешной оплате */}
                {showPaymentSuccess && (
                    <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-fade-in">
                        <i className="fa fa-check-circle text-2xl"></i>
                        <div>
                            <div className="font-semibold">Оплата успешна!</div>
                            <div className="text-sm opacity-90">Подписка активирована</div>
                        </div>
                    </div>
                )}
                
                <div className="max-w-md mx-auto w-full">
                    {/* Заголовок с кнопкой обновления */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-white">Общее</h2>
                        <button 
                            onClick={loadKeyInfo}
                            className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition-colors cursor-pointer flex items-center gap-2"
                        >
                            <i className="fa fa-refresh text-xs"></i>
                            Обновить
                        </button>
                    </div>
                    
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                                <i className="fa fa-user text-accent text-xl"></i>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">{userData?.email || "Пользователь"}</h3>
                                <p className="text-sm text-gray-400">
                                    {subscriptionTier === "trial" ? "Пробный период" : "Активная подписка"}
                                </p>
                            </div>
                        </div>
                        
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between py-2 border-b border-zinc-700">
                                <span className="text-gray-400">Подписка</span>
                                <span className="text-white font-medium">
                                    {subscriptionTier === "trial" ? "Trial" : subscriptionTier === "pro" ? "Pro" : "Basic"}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-zinc-700">
                                <span className="text-gray-400">Действует до</span>
                                <span className="text-white">{subscriptionExpires}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-zinc-700">
                                <span className="text-gray-400">Лимит в день</span>
                                <span className="text-white">{dailyLimit} запросов</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-gray-400">Использовано сегодня</span>
                                <span className="text-white">{todayUsage} / {dailyLimit}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-gray-400">Осталось</span>
                                <span className={remaining > 10 ? "text-green-400" : "text-red-400"}>
                                    {remaining} запросов
                                </span>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            {subscriptionTier === "trial" && (
                                <>
                                    <button 
                                        onClick={() => handleUpgrade("pro")}
                                        className="w-full px-4 py-2.5 bg-accent/20 hover:bg-accent/30 text-accent font-medium rounded transition-colors cursor-pointer"
                                    >
                                        Pro - 500 запросов/день (990₽/мес)
                                    </button>
                                    <button 
                                        onClick={() => handleUpgrade("pro_plus")}
                                        className="w-full px-4 py-2.5 bg-accent hover:bg-accent/90 text-white font-medium rounded transition-colors cursor-pointer"
                                    >
                                        Pro Plus - 2000 запросов/день (1990₽/мес)
                                    </button>
                                </>
                            )}
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
                        {step === "email" && (isLogin ? "Войдите, чтобы продолжить" : "3 дня бесплатно для новых пользователей")}
                        {step === "otp" && "Введите код из письма"}
                        {step === "password" && "Создайте пароль"}
                    </p>
                </div>

                {/* Шаг 1: Email (для регистрации) или Email+Пароль (для входа) */}
                {step === "email" && (
                    <>
                        {isLogin ? (
                            // Вход: email + пароль сразу
                            <form onSubmit={handleLogin} className="space-y-4">
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
                                        autoFocus
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
                                    {loading ? "Вход..." : "Войти"}
                                </button>
                            </form>
                        ) : (
                            // Регистрация: только email
                            <form onSubmit={handleSendCode} className="space-y-4">
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
                                        autoFocus
                                    />
                                </div>

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
                                    {loading ? "Отправка..." : "Получить код"}
                                </button>
                            </form>
                        )}
                    </>
                )}

                {/* Шаг 2: OTP */}
                {step === "otp" && (
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-4 text-center">
                                Код отправлен на {email}
                            </label>
                            <div className="flex gap-2 justify-center">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        className="w-12 h-14 text-center text-2xl font-bold bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-accent transition-colors"
                                        disabled={loading}
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </div>
                        </div>

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
                            {loading ? "Проверка..." : "Подтвердить"}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep("email")}
                            className="w-full text-gray-400 hover:text-gray-300 text-sm cursor-pointer"
                        >
                            ← Изменить email
                        </button>
                    </form>
                )}

                {/* Шаг 3: Пароль (только для регистрации) */}
                {step === "password" && (
                    <form onSubmit={handleSetPassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Пароль
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Минимум 6 символов"
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                                disabled={loading}
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Подтвердите пароль
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Повторите пароль"
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                                disabled={loading}
                            />
                        </div>

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
                            {loading ? "Создание аккаунта..." : "Завершить регистрацию"}
                        </button>
                    </form>
                )}

                {step === "email" && (
                    <>
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    resetForm();
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
                    </>
                )}
            </div>
        </div>
    );
};

export const SettingsContent = memo(SettingsContentComponent);
