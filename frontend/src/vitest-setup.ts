// src/vitest-setup.ts
import '@testing-library/jest-dom';
import { readable } from 'svelte/store';
import { vi } from 'vitest';

// $app/stores 모킹: 라우팅/페이지 스토어가 필요한 컴포넌트 대비
vi.mock('$app/stores', () => {
  const navigating = readable(null);
  const page = readable({
    url: new URL('http://localhost/'),
    params: {},
    route: { id: null },
    status: 200,
    error: null,
    data: {},
  });
  const updated = { subscribe: readable(false).subscribe, check: () => false };
  return { navigating, page, updated };
});

// $app/paths 모킹: base/assets 참조 대비
vi.mock('$app/paths', () => {
  return { base: '', assets: '', relative: false };
});

// (선택) $app/environment 모킹: 브라우저 여부 등 참조 시
vi.mock('$app/environment', () => ({
  browser: true,
  dev: true,
  building: false,
  version: 'test',
}));
