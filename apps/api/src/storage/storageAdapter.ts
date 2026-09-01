import * as crypto from 'node:crypto';
import type { StorageAdapter, StorageItem } from '@sih26019/shared-types';
import { BadRequestError } from '../errors/index.js';

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'text/csv',
  'application/geo+json',
  'application/json',
  'image/png',
  'image/jpeg',
  'text/plain',
] as const;

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export interface StoredBlob {
  key: string;
  data: Buffer;
  mimeType: string;
  sizeBytes: number;
  checksumSha256: string;
  createdAt: string;
}

/**
 * Provider-neutral safe memory/blob storage adapter for local and test environments.
 */
export class MemoryStorageAdapter implements StorageAdapter {
  private readonly storage = new Map<string, StoredBlob>();

  /**
   * Validates MIME type and file size before storing the binary payload.
   */
  async upload(key: string, data: Uint8Array | Buffer, mimeType: string): Promise<StorageItem> {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);

    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestError(
        `File exceeds maximum permitted size of ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB.`,
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(mimeType as (typeof ALLOWED_MIME_TYPES)[number])) {
      throw new BadRequestError(
        `MIME type "${mimeType}" is not allowed. Permitted types: ${ALLOWED_MIME_TYPES.join(', ')}.`,
      );
    }

    const checksumSha256 = crypto.createHash('sha256').update(buffer).digest('hex');
    const now = new Date().toISOString();

    const storedBlob: StoredBlob = {
      key,
      data: buffer,
      mimeType,
      sizeBytes: buffer.length,
      checksumSha256,
      createdAt: now,
    };

    this.storage.set(key, storedBlob);

    return {
      key,
      sizeBytes: buffer.length,
      mimeType,
      lastModified: now,
      checksum: checksumSha256,
    };
  }

  /**
   * Retrieves binary buffer for a stored item.
   */
  async getBuffer(key: string): Promise<StoredBlob | null> {
    return this.storage.get(key) ?? null;
  }

  /**
   * Returns a local safe virtual download URI.
   */
  async getDownloadUrl(key: string): Promise<string> {
    if (!this.storage.has(key)) {
      throw new BadRequestError(`File key "${key}" not found in storage.`);
    }
    return `/api/v1/evidence/download/${encodeURIComponent(key)}`;
  }

  async exists(key: string): Promise<boolean> {
    return this.storage.has(key);
  }

  async delete(key: string): Promise<boolean> {
    return this.storage.delete(key);
  }

  /**
   * Helper to generate a collision-safe, path-traversal-free storage key.
   */
  static generateStorageKey(fileName: string): string {
    const baseName = fileName.replace(/^.*[\\/]/, '');
    const sanitized = baseName.replace(/\.{2,}/g, '_').replace(/[^a-zA-Z0-9._-]/g, '_');
    const uuid = crypto.randomUUID();
    return `evidence/${uuid}_${sanitized}`;
  }
}

export const defaultStorageAdapter = new MemoryStorageAdapter();
