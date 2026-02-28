let weakFallbackCounter = 0;

function getCrypto(): Crypto | null {
    if (typeof globalThis === 'undefined' || typeof globalThis.crypto === 'undefined') {
        return null;
    }
    return globalThis.crypto;
}

function uuidFromGetRandomValues(cryptoApi: Crypto): string {
    const bytes = new Uint8Array(16);
    cryptoApi.getRandomValues(bytes);

    // RFC 4122 v4 variant/version bits.
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
    return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20),
    ].join('-');
}

function weakIdFallback(): string {
    weakFallbackCounter = (weakFallbackCounter + 1) % 1000000;
    const timestamp = Date.now().toString(36);
    const counter = weakFallbackCounter.toString(36).padStart(4, '0');
    const random = Math.random().toString(36).slice(2, 12);
    return `${timestamp}-${counter}-${random}`;
}

export function generateId(): string {
    const cryptoApi = getCrypto();

    if (cryptoApi?.randomUUID) {
        return cryptoApi.randomUUID();
    }

    if (cryptoApi?.getRandomValues) {
        return uuidFromGetRandomValues(cryptoApi);
    }

    return weakIdFallback();
}

