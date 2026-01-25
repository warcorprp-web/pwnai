// Генерация fingerprint браузера для идентификации анонимных пользователей

export async function generateFingerprint(): Promise<string> {
    const components = [
        navigator.userAgent,
        navigator.language,
        new Date().getTimezoneOffset(),
        screen.width + "x" + screen.height,
        screen.colorDepth,
        navigator.hardwareConcurrency || 0,
        navigator.platform,
    ];

    const data = components.join("|");
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    return hashHex;
}
