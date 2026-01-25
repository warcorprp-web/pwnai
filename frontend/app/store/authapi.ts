// API клиент для Искра Backend

const API_BASE_URL = import.meta.env.DEV 
    ? "http://localhost:3540/api" 
    : "https://cli.cryptocatslab.ru/api";

export interface AuthResponse {
    success: boolean;
    token?: string;
    user?: {
        id: string;
        email: string;
        subscription_tier?: string;
        subscription_expires?: string;
    };
    error?: string;
}

export interface AIResponse {
    success: boolean;
    message?: string;
    response?: string;
    remainingRequests?: number;
    error?: string;
}

export const authApi = {
    // Отправка OTP кода для регистрации
    async sendCode(email: string): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/send-code`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        return response.json();
    },

    // Проверка OTP кода
    async verifyCode(email: string, code: string): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/verify-code`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code }),
        });
        return response.json();
    },

    // Завершение регистрации с паролем
    async register(email: string, password: string): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        return response.json();
    },

    // Вход
    async login(email: string, password: string): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        return response.json();
    },
};

export const aiApi = {
    // Анонимный AI запрос
    async anonymousRequest(prompt: string, deviceId: string, fingerprint: string): Promise<AIResponse> {
        const response = await fetch(`${API_BASE_URL}/ai/anonymous`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, deviceId, fingerprint }),
        });
        return response.json();
    },

    // Авторизованный AI запрос
    async authenticatedRequest(prompt: string, token: string): Promise<AIResponse> {
        const response = await fetch(`${API_BASE_URL}/ai/request`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ prompt }),
        });
        return response.json();
    },
};
