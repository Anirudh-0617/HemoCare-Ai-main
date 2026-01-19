
import { encryptData, decryptData } from './encryptionService';

// Wrapper for LocalStorage that handles Encryption transparently (Async)
export const SecureStorage = {
    setItem: async (key: string, value: any) => {
        try {
            if (value === null || value === undefined) return;
            const encrypted = await encryptData(value);
            localStorage.setItem(key, encrypted);
        } catch (e) {
            console.error('Secure Set Error', e);
        }
    },

    getItem: async (key: string, defaultValue: any = null) => {
        try {
            const encrypted = localStorage.getItem(key);
            if (!encrypted) return defaultValue;
            const decrypted = await decryptData(encrypted);
            return decrypted !== null ? decrypted : defaultValue;
        } catch (e) {
            console.error('Secure Get Error', e);
            return defaultValue;
        }
    },

    removeItem: (key: string) => {
        localStorage.removeItem(key);
    },

    clear: () => {
        localStorage.clear();
    }
};
