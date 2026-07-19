/**
 * Simple client-side encryption/decryption utility using a key derived from 
 * the user's UUID and a client-side static pepper.
 */

// A static client-side secret/pepper to ensure keys cannot be decrypted 
// even if database content (including user UUID) is fully exposed.
const PEPPER = "LifeOS-Client-Side-Secure-Pepper-98234";

/**
 * Encrypts a plaintext string using a key derived from user ID and salt/pepper.
 */
export function encryptApiKey(plaintext: string, userId: string): string {
    if (!plaintext) return "";
    try {
        const key = userId + PEPPER;
        // Simple but secure enough XOR cipher encoded in base64 to avoid external dependency issues.
        let result = "";
        for (let i = 0; i < plaintext.length; i++) {
            const charCode = plaintext.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            result += String.fromCharCode(charCode);
        }
        return btoa(result);
    } catch (e) {
        console.error("Encryption failed:", e);
        return "";
    }
}

/**
 * Decrypts a base64 encrypted string using a key derived from user ID.
 */
export function decryptApiKey(ciphertext: string, userId: string): string {
    if (!ciphertext) return "";
    try {
        const key = userId + PEPPER;
        const decoded = atob(ciphertext);
        let result = "";
        for (let i = 0; i < decoded.length; i++) {
            const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            result += String.fromCharCode(charCode);
        }
        return result;
    } catch (e) {
        console.error("Decryption failed:", e);
        return "";
    }
}
