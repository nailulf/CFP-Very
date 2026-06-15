import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // All booking times are treated as WIB (Asia/Jakarta). Pin the test timezone so
    // date-based availability tests are deterministic regardless of the host machine TZ.
    env: { TZ: 'Asia/Jakarta' },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // `server-only` throws when imported outside a Next.js server bundle; stub it for tests.
      'server-only': path.resolve(__dirname, 'src/test/empty-module.ts'),
    },
  },
});
