import type { IsoTimestamp } from '../timestamp.js';

/**
 * Storage object descriptor.
 */
export interface StorageItem {
  key: string;
  sizeBytes: number;
  mimeType: string;
  lastModified: IsoTimestamp;
  checksum?: string;
}

/**
 * Provider-neutral interface for blob and object storage operations.
 */
export interface StorageAdapter {
  upload(key: string, data: Uint8Array | Buffer, mimeType: string): Promise<StorageItem>;
  getDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
}
