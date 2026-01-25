// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

// Счётчик бесплатных запросов (хранится локально)
export const freeRequestCountAtom = atomWithStorage<number>("iskra:free-requests", 0);

// Лимит бесплатных запросов
export const FREE_REQUEST_LIMIT = 3;

// Проверка, исчерпан ли лимит
export const isFreeLimitReachedAtom = atom((get) => {
    const count = get(freeRequestCountAtom);
    return count >= FREE_REQUEST_LIMIT;
});

// JWT токен
export const authTokenAtom = atomWithStorage<string | null>("iskra:auth-token", null);

// Данные пользователя
export const userDataAtom = atomWithStorage<{
    id: string;
    email: string;
    subscription_tier?: string;
    subscription_expires?: string;
} | null>("iskra:user-data", null);

// Состояние авторизации
export const isAuthenticatedAtom = atom(
    (get) => {
        const token = get(authTokenAtom);
        return token !== null;
    }
);

// Флаг попытки превышения лимита (показывать баннер)
export const showLimitBannerAtom = atom<boolean>(false);

// Device ID для анонимных пользователей
export const deviceIdAtom = atomWithStorage<string>("iskra:device-id", () => {
    return crypto.randomUUID();
});
