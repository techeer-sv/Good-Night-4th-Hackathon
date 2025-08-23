// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      // TS 경로 인식 + Vitest 번들에서 $lib를 실제 폴더로 매핑
      $lib: path.resolve('./src/lib'),
    },
  },
  test: {
    // ✅ Vitest가 E2E(Playwright) 폴더/산출물을 건드리지 않도록 명시
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: [
      'e2e/**',
      'playwright-report/**',
      'test-results/**',
      'node_modules/**',
      'dist/**',
      '.svelte-kit/**',
    ],
    environment: 'jsdom',         // Svelte 컴포넌트 DOM 테스트용
    setupFiles: ['./src/vitest-setup.ts'],
    globals: true,                // @testing-library/jest-dom 등 글로벌 매칭
    css: true,                    // 스타일 임포트 허용(필요 시)
  },
});