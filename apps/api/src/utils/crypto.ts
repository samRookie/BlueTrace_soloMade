import { scrypt, randomBytes, timingSafeEqual, createHash, randomUUID } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const SCRYPT_KEY_LENGTH = 64;

/**
 * Hashes a plaintext password using a salted scrypt algorithm.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, SCRYPT_KEY_LENGTH)) as Buffer;
  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
}

/**
 * Verifies a plaintext password against a stored scrypt hash in constant time.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const parts = storedHash.split('$');
    if (parts.length !== 3 || parts[0] !== 'scrypt') {
      return false;
    }

    const salt = parts[1];
    const originalHashHex = parts[2];

    if (!salt || !originalHashHex) {
      return false;
    }

    const originalKey = Buffer.from(originalHashHex, 'hex');
    const derivedKey = (await scryptAsync(password, salt, SCRYPT_KEY_LENGTH)) as Buffer;

    if (originalKey.length !== derivedKey.length) {
      return false;
    }

    return timingSafeEqual(originalKey, derivedKey);
  } catch {
    return false;
  }
}

/**
 * Generates a cryptographically random 256-bit session token string.
 */
export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Computes a SHA-256 hash of a session token for secure database storage.
 */
export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Generates a unique UUID v4 identifier.
 */
export function generateSecureId(prefix?: string): string {
  const id = randomUUID();
  return prefix ? `${prefix}-${id}` : id;
}
