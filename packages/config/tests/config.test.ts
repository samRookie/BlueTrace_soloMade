import { describe, it, expect } from 'vitest';
import { parseConfig } from '../src/index.js';

describe('Config Foundation Package', () => {
  it('parses valid environment variables with defaults', () => {
    const config = parseConfig({});
    expect(config.NODE_ENV).toBe('development');
    expect(config.API_PORT).toBe(3001);
    expect(config.WEB_PORT).toBe(5173);
    expect(config.DATABASE_URL).toBe('postgresql://postgres:postgres@localhost:5432/sih26019_dev');
  });

  it('respects custom valid environment variables', () => {
    const config = parseConfig({
      NODE_ENV: 'production',
      API_PORT: '4000',
      WEB_PORT: '8080',
      DATABASE_URL: 'postgresql://user:pass@db.example.com:5432/prod_db',
    });
    expect(config.NODE_ENV).toBe('production');
    expect(config.API_PORT).toBe(4000);
    expect(config.WEB_PORT).toBe(8080);
    expect(config.DATABASE_URL).toBe('postgresql://user:pass@db.example.com:5432/prod_db');
  });

  it('throws an error on invalid port numbers', () => {
    expect(() =>
      parseConfig({
        API_PORT: 'invalid-port',
      }),
    ).toThrow(/Invalid API_PORT/);
  });

  it('throws an error on invalid NODE_ENV', () => {
    expect(() =>
      parseConfig({
        NODE_ENV: 'staging' as 'development',
      }),
    ).toThrow(/Configuration Error/);
  });
});
