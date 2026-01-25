// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

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
export const isAuthenticatedAtom = atom((get) => {
    const token = get(authTokenAtom);
    return token !== null;
});
