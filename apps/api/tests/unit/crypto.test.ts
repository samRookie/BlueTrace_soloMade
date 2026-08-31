import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  hashSessionToken,
  generateSecureId,
} from '../../src/utils/crypto.js';

describe('Security - Crypto & Password Hashing Utilities', () => {
  it('hashes and securely verifies valid passwords using salted scrypt', async () => {
    const password = 'TestSecretPassword#2026!';
    const hash = await hashPassword(password);

    expect(hash).toMatch(/^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/);

    const isMatch = await verifyPassword(password, hash);
    expect(isMatch).toBe(true);
  });

  it('rejects incorrect passwords during verification', async () => {
    const hash = await hashPassword('CorrectPassword123');
    const isMatch = await verifyPassword('WrongPassword456', hash);

    expect(isMatch).toBe(false);
  });

  it('handles malformed hashes gracefully without throwing exceptions', async () => {
    expect(await verifyPassword('Password', 'invalid-hash-string')).toBe(false);
    expect(await verifyPassword('Password', 'scrypt$short$hash')).toBe(false);
  });

  it('generates random session tokens and computes deterministic SHA-256 token hashes', () => {
    const token1 = generateSessionToken();
    const token2 = generateSessionToken();

    expect(token1).toHaveLength(64);
    expect(token2).toHaveLength(64);
    expect(token1).not.toBe(token2);

    const hash1 = hashSessionToken(token1);
    const hash2 = hashSessionToken(token1);
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it('generates secure UUID IDs with optional domain prefixes', () => {
    const id = generateSecureId('USR');
    expect(id).toMatch(/^USR-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });
});
