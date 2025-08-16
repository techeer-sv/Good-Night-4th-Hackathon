---
description: Guidelines for using Gemini (Google AI) models via CLI-style workflows in this project
applyTo: "**/*"
---

# Gemini CLI Workflow Instructions

이 문서는 프로젝트 내에서 **Gemini (Google AI)** 모델을 CLI 스타일로 활용하여 연구(Research), 코드 제안, 테스트 시나리오 생성, Taskmaster 작업 자동화를 수행하기 위한 규칙과 패턴을 정의합니다. (에이전트/도우미 전용 지침)

## 1. 목표 (Purpose)
- 반복 가능한 프롬프트 패턴을 표준화
- Taskmaster 태스크 / 서브태스크와 Gemini 출력 연결(Log & Traceability)
- 연구성 프롬프트와 실행성(코드 diff, 테스트 케이스) 결과를 구분해 저장
- 모델 선택/교체 시 마이그레이션 비용 최소화

## 2. 사전 준비 (Prerequisites)
1. `.env` 파일에 `GOOGLE_API_KEY` 추가 (CLI 또는 MCP 환경 둘 다 필요)
2. Taskmaster 모델 구성을 통해 Gemini 모델을 main/research/fallback 중 하나로 설정 가능:
   - 예: 
     ```bash
     task-master models --set-main gemini-1.5-pro
     task-master models --set-research gemini-1.5-flash
     ```
3. 로컬 임시 CLI 스크립트 생성(선택): `scripts/gemini-chat.mjs` (없다면 아래 예시 참고)로 단발성 프롬프트 수행
4. 연구 결과/생성물은 반드시 **Taskmaster update-subtask** 또는 **research tool**과 연계

## 3. 최소 CLI 스크립트 패턴 (Optional Helper)
> 이미 다른 도구(MCP `research`)로 충분하다면 생략 가능.

`scripts/gemini-chat.mjs` (예시 – 실제 생성 시 Node 18+ 가정):
```js
#!/usr/bin/env node
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "node:fs";

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) { console.error("Missing GOOGLE_API_KEY"); process.exit(1); }

const prompt = process.argv.slice(2).join(" ").trim();
if (!prompt) { console.error("Usage: gemini-chat <prompt>"); process.exit(1); }

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-1.5-flash" });
const result = await model.generateContent(prompt);
const text = result.response.text();
console.log("\n=== Gemini Response ===\n");
console.log(text);
if (process.env.GEMINI_SAVE) {
  fs.mkdirSync(".taskmaster/docs/research", { recursive: true });
  const file = `.taskmaster/docs/research/gemini-${Date.now()}.md`;
  fs.writeFileSync(file, `# Prompt\n${prompt}\n\n# Response\n${text}`);
  console.log(`\nSaved -> ${file}`);
}
```

`package.json` 스크립트 예시:
```jsonc
{
  "scripts": {
    "gemini:chat": "node scripts/gemini-chat.mjs"
  }
}
```

사용 예:
```bash
GOOGLE_API_KEY=xxx npm run gemini:chat -- "Summarize current UI state logic design trade-offs"
```

## 4. 사용 분류 (Usage Classes)
| 유형 | 목적 | 출력 처리 | 권장 모델 |
|------|------|-----------|-----------|
| Research | 최신 베스트프랙티스 / 라이브러리 비교 | `research` MCP tool + `update-subtask` 로그 | gemini-1.5-pro / flash |
| Ideation | 컴포넌트 설계, 상태 구조 변형 아이디어 | 초안 → 수동 검증 후 diff 작성 | gemini-1.5-flash |
| TestGen | E2E/유닛 테스트 케이스 설계 | 테스트 스켈레톤 파일 초안 | gemini-1.5-pro |
| Refactor Plan | 리팩터링 단계/리스크 정리 | 서브태스크 세분화 | gemini-1.5-pro |
| Prompt Harden | 반복 프롬프트 템플릿 개선 | instruction 파일 갱신 | flash → pro 검증 |

## 5. 표준 프롬프트 템플릿 (Templates)
### A. Research (업데이트 안전)
```
Role: You are a senior frontend architect.
Goal: 조사: <주제>
Context:
- 관련 태스크: <taskId(s)>
- 코드 요약(선택): <핵심 구조>
Deliver:
1. 핵심 결론 (bullet)
2. 선택지 비교 (표)
3. 리스크 & 미itigations
4. 권장 액션 (Taskmaster update-subtask용)
Output Format: markdown
```

### B. Test Case Generation
```
Goal: Generate Playwright test cases for <기능>
Constraints:
- Use data-testids if 존재, 없으면 role/label 우선
- 하나의 스펙은 독립 실행 가능
Output Sections:
1. Scenario List
2. Each Scenario: preconditions / steps / expected
3. Consolidated code (TS) skeleton
```

### C. Refactor Plan
```
Goal: Refactor <모듈/영역>
Show:
- Current Pain Points
- Target State (diagram style textual)
- Stepwise Migration (#, description, risk, rollback)
- Mapping to new subtasks (id placeholders)
```

## 6. Taskmaster 연계 규칙
1. 연구 완료 후: `update_subtask` 로 원문 핵심 요약 + 채택 결정 기록
2. 채택 안 한 아이디어도 “Rejected Ideas” 섹션에 남김 (재검토 방지)
3. 다단계 리팩터 계획은 우선 PRD 초안 → `parse_prd --append` → `analyze-complexity` → `expand_all`
4. 테스트 생성 결과는 임시 파일(`playwright.drafts/…`) 경로에 저장 후 성공 케이스만 정식 테스트 디렉터리로 이동

## 7. 출력 포맷 규칙
- 최상위 H1/H2 남용 금지 (요약은 H2 이하)
- 표준 섹션 순서: Summary → Details → Actions → References
- 코드 블록은 언어 지정 (```ts, ```bash 등)
- 긴 응답(>250줄)은 “(truncated)” 표시 후 원문 `.taskmaster/docs/research/*.md` 저장

## 8. 품질 체크리스트 (Gemini 응답 수용 전)
- [ ] 사실 검증 (문서/공식 레퍼런스 링크 2개 이상?)
- [ ] 로컬 코드 구조와 용어 일치?
- [ ] 모호한 표현 제거했는가?
- [ ] 실행 계획에 측정 가능한 결과 포함?
- [ ] 보안/성능 영향 언급(필요 시)?

## 9. 보안 & 개인정보
- 실 사용자 데이터, API secret, 토큰 값 절대 프롬프트에 직접 포함 금지
- 민감한 값은 placeholder (`<JWT>`, `<API_KEY>`) 사용
- 외부 전송(복사) 전 내부 전용 식별자 제거

## 10. 안티패턴 (금지)
- “Just rewrite the whole file” 식 대규모 무차별 리팩터 요청
- 테스트 없이 대규모 상태 구조 변경 계획 적용
- 공식 레퍼런스 미검증 서드파티 블로그 단일 출처 인용
- 과한 추상화 제안(사용 사례 2개 미만일 때)

## 11. 유지보수 규칙
- 새 프롬프트 패턴 반복 3회 이상 사용 시 본 문서에 추가
- 2회 이상 ‘Rejected Ideas’로 남은 패턴은 재사용 금지 목록에 기록
- 모델 변경(예: pro → flash) 시 성능/비용 영향 섹션 추가

## 12. 빠른 실행 스니펫 (예시)
```bash
# Research + 기록 (MCP research 도구 권장)
task-master research --query "React Query cache invalidation 최신 패턴" --detail high --save-file

# 수동 CLI 스크립트 활용 (선택)
GEMINI_MODEL=gemini-1.5-pro npm run gemini:chat -- "Generate Playwright scenarios for login edge cases"

# 연구 요약을 서브태스크 로그에 반영
task-master update-subtask --id=8.2 --prompt "[Research Summary]\n- ..."
```

## 13. 문제 해결 (Troubleshooting)
| 증상 | 점검 | 조치 |
|------|------|------|
| 401/403 응답 | `GOOGLE_API_KEY` 설정 여부 | 키 재발급 / .env 갱신 |
| 모델 not found | `task-master models` 출력 확인 | 정확한 모델명 재설정 |
| 응답 지연 | 대형 context 과다 | Prompt 축약 / flash 모델 전환 |
| 문서 저장 누락 | GEMINI_SAVE 미설정 | `export GEMINI_SAVE=1` 후 재실행 |

## 14. 업데이트 히스토리
- v0.1 (생성): Gemini CLI 지침 초안 작성 (2025-08-15)

---
이 문서는 Gemini 모델 기반 작업을 **예측 가능 / 재현 가능 / 감사 가능(auditable)** 하게 만드는 표준입니다. 필요 시 `self_improve.instructions.md` 흐름에 따라 개선하십시오.
---
description: How to use Google Gemini models via CLI (Task Master + direct API) in this project
applyTo: "**/*"
---

# Gemini CLI 사용 지침

이 문서는 프론트엔드 레포에서 Google Gemini (Google Generative AI) 모델을 CLI 환경에서 활용하는 방법과 Task Master와의 연계를 정리한다. 목표: (1) 환경 변수 안전 설정, (2) 단발 프롬프트 실행, (3) 반복 개발 워크플로우 통합, (4) 품질/비용 관리.

## 1. 준비사항
- Google AI Studio / Google Cloud 에서 API Key 발급
- `.env` (CLI) 또는 `.vscode/mcp.json` (MCP) 에 `GOOGLE_API_KEY` 추가
- Node 18+ 환경 유지
- Task Master 모델 설정 파일은 `.taskmaster/config.json` (직접 수정 금지, `task-master models` 명령 사용)

### 1.1 환경 변수 설정
`.env` 예시:
```
GOOGLE_API_KEY=AIza...your_key
```
`.vscode/mcp.json` 내 `env` 섹션 예시:
```json
{
  "mcpServers": {
    "task-master-ai": {
      "command": "npx",
      "args": ["-y", "--package=task-master-ai", "task-master-ai"],
      "env": {
        "GOOGLE_API_KEY": "${GOOGLE_API_KEY}"
      }
    }
  }
}
```

## 2. Task Master 와 Gemini 연동
Task Master 의 main / research / fallback 중 하나를 Gemini 모델로 지정 가능.

1) 사용 가능한 모델 확인 (내장 목록 + 현재 설정)
```
task-master models
```
2) 메인 모델을 Gemini 로 설정 (예: `gemini-1.5-pro`) 
```
task-master models --set-main gemini-1.5-pro
```
3) 리서치 모델만 Gemini 로 두고 메인은 다른 모델로 둘 수도 있음:
```
task-master models --set-research gemini-1.5-flash
```
> 모델 ID 는 Google 제공 최신 명칭 사용. 지원 여부는 `task-master models` 출력으로 검증.

### 2.1 모델 역할 전략
- main: 일반 태스크 생성/갱신 → 안정/균형형 `gemini-1.5-pro`
- research: 신속 요약/탐색 → 경량 `gemini-1.5-flash`
- fallback: 비용 절감 or 대체 (예: `gpt-4o-mini` 등 다른 프로바이더)

## 3. 직접 Gemini 호출 (간단 스크립트)
경량 실험이나 프롬프트 튜닝은 별도 스크립트로 수행 후, 확정된 프롬프트를 Task Master 태스크에 반영.

### 3.1 설치
(이미 의존성 없음) 별도 패키지 추가:
```
yarn add -D @google/generative-ai
```
> 프로토타입 단계라면 devDependencies 로 두고, 프로덕션 런타임 필요 시 dependencies 로 승격.

### 3.2 예시 스크립트 `scripts/gemini-run.mjs`
```js
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error('Missing GOOGLE_API_KEY');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: process.argv[2] || 'gemini-1.5-flash' });

const prompt = process.argv.slice(3).join(' ') || 'Hello Gemini, summarize project goals.';

const result = await model.generateContent(prompt);
const response = await result.response;
console.log(response.text());
```

### 3.3 package.json 스크립트 추가 예시
(이미 수동 수정했다면 중복 피하기)
```
"gemini": "node scripts/gemini-run.mjs"
```
사용:
```
yarn gemini "gemini-1.5-flash" "Summarize our state management approach"
```
또는 기본 모델:
```
yarn gemini "" "List key API endpoints we rely on"
```
(첫 인자 비우면 스크립트 기본값 사용)

## 4. Task Master 작업 흐름에 Gemini 반영
| 목적 | 방법 | 비고 |
|------|------|------|
| 태스크 생성 | `task-master add-task --prompt="..."` (Gemini main 설정시) | 프롬프트에 구체적 산출물 명시 |
| 서브태스크 확장 | `task-master expand --id=<id> --research` | research 역할을 flash 모델로 두면 속도 ↑ |
| 리팩터 구상 연구 | `task-master research --query="..." --detail=high` | 최신 best practice 탐색 |
| 구현 로그 | `task-master update-subtask --id=<id> --prompt="분석 결과 ..."` | 결정 근거 기록 |

## 5. 프롬프트 패턴 템플릿
- 기능 설계:
```
기능: <기능명>
요구: <목표/제약>
산출물: 타입 정의, edge case 3개, 테스트 아이디어 2개
형식: Markdown 섹션 (Types, EdgeCases, Tests)
```
- 리팩터 제안:
```
Context: 현재 코드 구조 개요 <요약>
Goal: 성능 / 가독성 향상 (우선순위 명시)
Output: 변경 전/후 비교 표 + 위험 요소 + 단계별 플랜
```
- API 통합 가이드:
```
Endpoint: <GET /api/...>
Need: 캐싱 전략 + 에러 분류 + 재시도 지침
Output: 표(구분/정책) + 예시 React Query 훅 코드
```

## 6. 품질 & 비용 관리 체크리스트
- flash 모델: 탐색 / 브레인스토밍 / 요약
- pro 모델: 구조적 산출물, 긴 맥락
- 장문 출력 필요 시: 목적/형식/제한(글자수, 섹션) 명확화
- 반복 호출 많은 경우: 프롬프트를 태스크 `details` 로 승격해 재사용
- 결과 품질 저하 시: (a) 명세 강화, (b) 예시 추가, (c) 금지/제외 조건 명시

## 7. 오류 대응
| 증상 | 원인 | 해결 |
|------|------|------|
| 401 / UNAUTHENTICATED | 키 오타 / 만료 | 키 재발급 후 `.env` 저장, 터미널 재시작 |
| 모델 not found | 오타/미지원 ID | `task-master models` 로 지원 모델 재확인 |
| 빈 응답 | prompt 빈약 / rate limit | 프롬프트 구체화, 잠시 후 재시도 |
| 긴 응답 잘림 | context/token 제한 | 출력 형식 분할 지시 (Part 1/2) |

## 8. 보안/거버넌스
- 비공개 토큰/개인정보 prompt 삽입 금지
- 내부 경로/시크릿은 요약 형태로 추상화 후 전달
- 민감 데이터 포함 산출물은 커밋 전 수동 검수

## 9. 모범 워크플로우 예시
```
# (A) 아이디어 러프 스케치
node scripts/gemini-run.mjs gemini-1.5-flash "Create outline for performance audit checklist"

# (B) 태스크 확정
(task-master add-task --prompt="프론트 성능 점검 체크리스트 작성 ...")

# (C) 세부 확장
(task-master expand --id=새태스크ID --research)

# (D) 구현 중 발견사항 기록
(task-master update-subtask --id=... --prompt="실측 LCP 3.2s -> 2.4s 개선 원인...")
```

## 10. 유지보수 규칙
- 새 모델 버전 등장 시: `task-master models --set-main <newID>` 시험 후 롤백 가능성 대비 이전 ID 기록
- 프롬프트 템플릿 2회 이상 재사용 → `.github/instructions` 내 별도 템플릿 파일화 고려
- 장기 실행 리서치 반복 시: 결과를 `.taskmaster/docs/research/` 로 저장 (`--save-file`) 후 태스크 링크

---
이 파일을 기반으로 Gemini 활용 흐름을 표준화하고, 산출물은 항상 Task Master 태스크/서브태스크의 `details` 로 귀결되도록 유지한다.
