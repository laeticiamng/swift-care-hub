/**
 * UrgenceOS — Offline Data Encryption
 * Provides AES-256-GCM encryption for IndexedDB patient data.
 * Uses Web Crypto API (no external dependency).
 *
 * Key derivation: PBKDF2 from user session token
 * Algorithm: AES-256-GCM with random IV per encryption
 */

const ALGO = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT = new TextEncoder().encode('urgenceos-offline-v1');

let _cachedKey: CryptoKey | null = null;

/**
 * Derive an AES-256 key from a passphrase (e.g., user JWT or session ID).
 * Uses PBKDF2 with 100k iterations for resistance to brute force.
 */
async function deriveKey(passphrase: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: SALT,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGO, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Initialize the encryption module with a passphrase.
 * Call once after login with the user's access token.
 */
export async function initEncryption(passphrase: string): Promise<void> {
  _cachedKey = await deriveKey(passphrase);
}

/**
 * Clear the cached key on logout.
 */
export function clearEncryptionKey(): void {
  _cachedKey = null;
}

/**
 * Check if encryption is initialized.
 */
export function isEncryptionReady(): boolean {
  return _cachedKey !== null;
}

/**
 * Encrypt a JSON-serializable object.
 * Returns a base64-encoded string containing IV + ciphertext.
 */
export async function encrypt(data: unknown): Promise<string> {
  if (!_cachedKey) {
    throw new Error('[OfflineCrypto] Encryption key not initialized. Call initEncryption() first.');
  }

  const plaintext = new TextEncoder().encode(JSON.stringify(data));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGO, iv },
    _cachedKey,
    plaintext
  );

  // Concatenate IV + ciphertext
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return uint8ToBase64(combined);
}

/**
 * Decrypt a base64-encoded string back to a JSON object.
 */
export async function decrypt<T = unknown>(encryptedBase64: string): Promise<T> {
  if (!_cachedKey) {
    throw new Error('[OfflineCrypto] Encryption key not initialized. Call initEncryption() first.');
  }

  const combined = base64ToUint8(encryptedBase64);
  const iv = combined.slice(0, IV_LENGTH);
  const ciphertext = combined.slice(IV_LENGTH);

  const plaintext = await crypto.subtle.decrypt(
    { name: ALGO, iv },
    _cachedKey,
    ciphertext
  );

  const json = new TextDecoder().decode(plaintext);
  return JSON.parse(json) as T;
}

/**
 * Encrypt if key is available, otherwise return data as-is.
 * Graceful degradation for demo mode or when encryption isn't initialized.
 */
export async function encryptIfReady(data: unknown): Promise<string | unknown> {
  if (!_cachedKey) return data;
  return encrypt(data);
}

/**
 * Decrypt if the value is an encrypted string, otherwise return as-is.
 */
export async function decryptIfNeeded<T = unknown>(value: string | unknown): Promise<T> {
  if (!_cachedKey || typeof value !== 'string') return value as T;
  try {
    return await decrypt<T>(value);
  } catch {
    // Not encrypted or wrong key — return as-is
    return value as T;
  }
}

// ── Base64 helpers (no btoa/atob for binary safety) ──

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
