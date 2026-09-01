import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStorageAdapter } from '../../src/storage/storageAdapter.js';
import { BadRequestError } from '../../src/errors/index.js';

describe('MemoryStorageAdapter (Safe File Attachment Storage)', () => {
  let adapter: MemoryStorageAdapter;

  beforeEach(() => {
    adapter = new MemoryStorageAdapter();
  });

  it('successfully uploads and stores allowlisted file types (PDF, CSV, GeoJSON)', async () => {
    const textData = Buffer.from('sample csv content,col1,col2\nval1,val2', 'utf8');
    const result = await adapter.upload('evidence/test.csv', textData, 'text/csv');

    expect(result.key).toBe('evidence/test.csv');
    expect(result.sizeBytes).toBe(textData.length);
    expect(result.mimeType).toBe('text/csv');
    expect(result.checksum).toBeDefined();

    const exists = await adapter.exists('evidence/test.csv');
    expect(exists).toBe(true);

    const stored = await adapter.getBuffer('evidence/test.csv');
    expect(stored).not.toBeNull();
    expect(stored?.data.toString('utf8')).toBe('sample csv content,col1,col2\nval1,val2');
  });

  it('rejects forbidden/non-allowlisted MIME types', async () => {
    const exeBuffer = Buffer.from('executable binary data', 'utf8');
    await expect(
      adapter.upload('evidence/malicious.exe', exeBuffer, 'application/x-msdownload'),
    ).rejects.toThrow(BadRequestError);
  });

  it('rejects files exceeding maximum size (10MB)', async () => {
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
    await expect(
      adapter.upload('evidence/huge.pdf', largeBuffer, 'application/pdf'),
    ).rejects.toThrow(BadRequestError);
  });

  it('generates collision-safe, path-traversal-free storage keys', () => {
    const rawName = '../../etc/passwd.pdf';
    const key = MemoryStorageAdapter.generateStorageKey(rawName);

    expect(key.startsWith('evidence/')).toBe(true);
    expect(key.includes('..')).toBe(false);
    expect(key.endsWith('.pdf')).toBe(true);
  });
});
