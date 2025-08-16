---
description: Guidelines for using the Context7 MCP server to fetch library documentation for grounded implementation
applyTo: '**/*'
---

# Context7 Usage Instructions

`context7` MCP 서버는 외부 라이브러리 공식 문서를 쿼리하여 **근거 기반(grounded)** 구현 / 리팩터 / 마이그레이션을 지원합니다.

## 1. 목적

- 최신 API 시그니처, Hook 변화, Deprecated 항목 즉시 확인
- 추측 기반 구현 감소 → 타입/동작 불일치 예방
- Task / Subtask 세부 구현 지시문에 1차 출처(official docs) 링크 삽입

## 2. 핵심 도구

| Tool                 | 기능                                      | 필수                        | 메모                           |
| -------------------- | ----------------------------------------- | --------------------------- | ------------------------------ |
| `resolve-library-id` | 문자열 → 내부 라이브러리 ID 매핑          | libraryName                 | 가장 근접 match 선택 근거 기록 |
| `get-library-docs`   | 선택된 ID + (선택 topic) 문서 스니펫 수집 | context7CompatibleLibraryID | tokens 조절로 길이 제한        |

## 3. 기본 흐름

+1. 대상 후보 식별 (예: react-query, zustand, react-router)
+2. `resolve-library-id` 호출 → 반환된 후보 중 선택 이유 간단 요약
+3. `get-library-docs` (topic 지정: hooks, routing, cache, pagination 등)
+4. 핵심 문구/예제 추출 → Task/Subtask `details` 에 인용 (출처 ID + topic)
+5. 필요한 경우 추가 topic 반복

## 4. 호출 전략

- 작은 단위: topic 세분 ("hooks", "routing") → 토큰 절약 + 집중도↑
- 큰 라이브러리: 우선 Hooks 개요 → 세부 API 단계적 확대
- 마이그레이션: 구버전 vs 신버전 topic 각각 수집 후 diff 표 작성

## 5. Taskmaster 연계

| 목적                  | 패턴                                                   |
| --------------------- | ------------------------------------------------------ |
| 신규 기능 태스크 작성 | docs 핵심 예제 → `add_task --prompt` 에 포함           |
| 서브태스크 확장       | 확장 전 관련 topic fetch → 결과 요약 후 expand         |
| 리팩터                | 이전 구현 vs 공식 예제 비교 테이블 첨부                |
| 테스트 보강           | 문서 정의된 edge / error case 추출 → 테스트 시나리오화 |

## 6. 문서 인용 포맷 예시

```
DocsRef:
- source: /tanstack/query (topic: hooks)
- snippet: useQuery(options) returns { data, error, status, fetchStatus }
- note: fetchStatus 추가됨 (로딩 세분화) → 기존 spinner 로직 분리 필요
```

## 7. 품질 체크

- 라이브러리 ID 선택 근거 기록? (왜 이 ID)
- Snippet 는 최소 변경 후 원문 유지?
- Deprecated / Breaking 항목 강조?
- Task 세부 구현과 직접 연결되는 Action 문장 존재?

## 8. 토큰 / 성능 관리

- `tokens` (get-library-docs) 값 단계적 증가 (예: 2000 → 5000)
- topic 범위 좁히기 (e.g., "mutation" 대신 "mutation caching")
- 중복 topic 요청 회피: 동일 topic 1회 저장 후 재활용

## 9. 안티패턴

- resolve 없이 임의 ID 직접 추정
- 대량 topic 한 번에 요청 (context 혼잡)
- Snippet 출처 미표기
- 추출 즉시 코드에 반영(검증 생략)

## 10. 예시 워크플로우 (React Query v5 캐싱 변경 조사)

```
resolve-library-id(libraryName="react-query")
get-library-docs(context7CompatibleLibraryID="/tanstack/query", topic="hooks", tokens=3000)
process_thought(stage=Research, thought="React Query v5 hook core changes ...")
update_subtask(id=12.1, prompt="DocsRef:\n- source: /tanstack/query (hooks) ...")
```

## 11. 유지보수

- library ID 매칭 실패 사례 누적 시 FAQ 섹션 추가 예정
- 반복 topic 패턴 3회 이상 → 템플릿으로 승격

---

Context7 는 ‘추측 구현’을 줄이고 ‘문서 기반 변경’을 강제하기 위한 도구입니다. 인용 포맷 준수로 감사 추적성을 확보하세요.
