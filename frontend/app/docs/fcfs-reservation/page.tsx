import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeStringify from 'rehype-stringify';

// Inject utility classes into rendered HTML via a small post-process (regex replacements for common tags)
function enhanceHtml(html: string): string {
  return html
    .replaceAll('<h1','<h1 class="mt-2 mb-6 text-3xl font-semibold tracking-tight"')
    .replaceAll('<h2','<h2 class="mt-12 mb-4 text-2xl font-semibold first:mt-0 border-b border-neutral-200 pb-2"')
    .replaceAll('<h3','<h3 class="mt-8 mb-3 text-xl font-semibold"')
    .replaceAll('<h4','<h4 class="mt-6 mb-2 text-lg font-semibold"')
    .replaceAll('<p','<p class="leading-relaxed my-4"')
    .replaceAll('<ul','<ul class="my-4 list-disc list-outside pl-6 space-y-1"')
    .replaceAll('<ol','<ol class="my-4 list-decimal list-outside pl-6 space-y-1"')
    .replaceAll('<blockquote','<blockquote class="border-l-2 border-neutral-300 pl-4 italic text-neutral-700 my-6"')
    .replaceAll('<table','<table class="w-full border-collapse text-sm my-6"')
    .replaceAll('<thead','<thead class="bg-neutral-50"')
    .replaceAll('<th','<th class="border border-neutral-200 px-3 py-2 text-left font-medium align-middle"')
    .replaceAll('<td','<td class="border border-neutral-200 px-3 py-2 align-top"')
    .replaceAll('<pre','<pre class="my-6 overflow-x-auto rounded-md border border-neutral-200 bg-neutral-50 p-4 text-sm leading-relaxed"')
    .replaceAll('<code','<code class="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[13px]"');
}

export const metadata: Metadata = {
  title: 'FCFS Reservation API Spec – TicketTock',
  description: 'First-Come First-Served single seat reservation API specification (draft) with concurrency and contention handling.',
};

async function renderMarkdown(): Promise<string> {
  try {
    const filePath = path.join(process.cwd(), 'reservation_fcfs.md');
    const raw = fs.readFileSync(filePath, 'utf8');
    const file = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeSlug)
      .use(rehypeAutolinkHeadings, { behavior: 'wrap', properties: { class: 'no-underline hover:underline underline-offset-4' } })
      .use(rehypeStringify, { allowDangerousHtml: true })
      .process(raw);
    return enhanceHtml(String(file));
  } catch {
    return ''; // handled below
  }
}

export default async function FcfsReservationSpecPage() {
  const html = await renderMarkdown();
  if (!html) return notFound();

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-10">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">FCFS 좌석 선착순 예약 API 명세</h1>
        <p className="text-neutral-600 text-sm">Updated on 2025-08-17 · Draft</p>
      </header>
      <aside className="hidden xl:block float-right w-56 ml-8 mb-8">
        <nav aria-label="On this page" className="sticky top-28 text-sm space-y-2">
          <h2 className="font-semibold text-neutral-700 uppercase tracking-wide text-xs mb-2">Contents</h2>
          <ul className="space-y-1 text-neutral-700">
            {['개요','데이터 모델 (Seat)','엔드포인트 요약','요청(Request)','응답(Response)','Reason Codes','시퀀스 (Mermaid)','동시성 & 원자성','Redis 키 전략 (예시)','성능 / 확장 고려','테스트 시나리오 제안','프런트엔드 처리 패턴','보안 & 검증','향후 개선 로드맵','요약 (한국어)','English Quick Summary'].map((t) => {
              const id = t.toLowerCase().replace(/[^a-z0-9가-힣]+/g,'-').replace(/^-|-$/g,'');
              return <li key={id}><a href={`#${id}`} className="hover:text-black">{t}</a></li>;
            })}
          </ul>
        </nav>
      </aside>
  <article className="prose prose-neutral max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
