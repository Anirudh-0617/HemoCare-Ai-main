
// Basic wrapper using Web Crypto API for AES-GCM encryption
// Note: In a real production app, Key Management is the hardest part.
// Here we derive a key from a static app secret + user ID (if available, else generic).
// Since this runs in the browser, "perfect" security against a local attacker with full machine access is impossible
// without the user entering a password to decrypt the local key every time.
// We assume "Offline Mode" convenience, so we store the Key Material in a way that requires at least 'some' effort to break.

const APP_SECRET = 'HEMOCARE_SECURE_2026_HIPAA_V1'; // In prod, use env var

const getDerivedKey = async (salt: string) => {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(APP_SECRET),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: enc.encode(salt),
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
};

export const encryptData = async (data: any, salt: string = 'default-salt'): Promise<string> => {
    try {
        const key = await getDerivedKey(salt);
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const enc = new TextEncoder();
        const encodedData = enc.encode(JSON.stringify(data));

        const encryptedContent = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            encodedData
        );

        // Combine IV + Encrypted Data -> Base64
        const buffer = new Uint8Array(iv.byteLength + encryptedContent.byteLength);
        buffer.set(iv, 0);
        buffer.set(new Uint8Array(encryptedContent), iv.byteLength);

        return btoa(String.fromCharCode(...buffer));
    } catch (e) {
        console.error("Encryption Failed", e);
        return "";
    }
};

export const decryptData = async (ciphertext: string, salt: string = 'default-salt'): Promise<any> => {
    try {
        const key = await getDerivedKey(salt);
        const binaryString = atob(ciphertext);
        const buffer = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            buffer[i] = binaryString.charCodeAt(i);
        }

        const iv = buffer.slice(0, 12);
        const data = buffer.slice(12);

        const decryptedContent = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            data
        );

        const dec = new TextDecoder();
        return JSON.parse(dec.decode(decryptedContent));
    } catch (e) {
        console.error("Decryption Failed or Bad Key", e);
        return null;
    }
};
