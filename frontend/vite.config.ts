/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { paraglideVitePlugin } from '@inlang/paraglide-js'
import devtoolsJson from 'vite-plugin-devtools-json'
import path from 'path'

export default defineConfig(({ mode }) => {
  const isTest = mode === 'test' || !!process.env.VITEST

  return {
    plugins: [
      tailwindcss(),

      // 테스트에는 sveltekit 대신 가벼운 svelte 플러그인 사용
      isTest ? svelte() : sveltekit(),

      !isTest && devtoolsJson(),
      !isTest &&
        paraglideVitePlugin({
          project: './project.inlang',
          outdir: './src/lib/paraglide'
        })
    ].filter(Boolean),

    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5800',
          changeOrigin: true,
        },
      },
    },

    test: {
      globals: true,
      include: ['src/**/*.spec.ts'],
      exclude: ['e2e/**', 'tests/e2e/**'],
      setupFiles: ['./vitest-setup-client.ts'],
      browser: {
        enabled: true,
        name: 'chromium',
        provider: 'playwright',
      },

      // 멈춤 진단에 유용
      reporters: ['default', 'hanging-process'],
      testTimeout: 30000,
      hookTimeout: 30000,
      // 문제 재현/고립용 (원인 파악 끝나면 제거 OK)
      poolOptions: { threads: { singleThread: true } }
    },

    resolve: {
      alias: {
        $lib: path.resolve(__dirname, './src/lib')
      }
    }
  }
})