# Gemini Agent: Tool & Workflow Guides

This document contains guides for various tools and workflows available in this environment.

---

## 1. Task Master AI Integration Guide

(This guide focuses on using Task Master for project management. It has been customized for this SvelteKit project.)

### Essential Commands

- `task-master list`: Show all tasks.
- `task-master next`: Get the next available task.
- `task-master show <id>`: View detailed task information.
- `task-master expand <id>`: Break a task into subtasks.
- `task-master set-status --id=<id> --status=done`: Mark a task as complete.

### SvelteKit Workflow Integration

- **Implementation**: Implement code in `.svelte` files and associated logic in `+page.ts` or `+server.ts`.
- **Testing**: Use `vitest` for unit tests and `playwright` for E2E tests.
- **Dependencies**: Use `npm install` to manage dependencies from `package.json`.

---

## 2. Serena MCP Guide

(This guide focuses on using the Serena toolkit for advanced code analysis, manipulation, and language-aware operations.)

### Overview

Serena is a dual-layer coding agent toolkit that provides a unified interface over multiple Language Server Protocols (LSPs). It allows for precise, symbol-based code editing, finding references, and other language-aware operations, which are essential for complex refactoring and implementation tasks.

### Project Management

- `uvx --from git+https://github.com/oraios/serena serena start-mcp-server`: Start the Serena MCP server from the project root.
- `uvx --from git+https://github.com/oraios/serena serena project index`: Index the project for faster tool performance.

### Core Serena Tools

- **Symbol Operations**: `find_symbol`, `find_referencing_symbols`, `replace_symbol_body` for language-aware code editing.
- **File Operations**: `read_file`, `replace_regex`, `search_for_pattern` for general file manipulation.
- **Memory**: `write_memory`, `read_memory` for persistent project knowledge.

---

## 3. Sequential Thinking MCP Server Guide

(This guide explains the tool for breaking down complex problems into a structured, step-by-step thinking process.)

- **Purpose**: Use for planning, analysis, and complex problem-solving where the scope may not be clear initially.
- **Tool**: `sequential_thinking`
- **Key Inputs**: `thought`, `nextThoughtNeeded`, `thoughtNumber`

---

## 4. Context7 Usage Instructions

(`context7` MCP 서버는 외부 라이브러리 공식 문서를 쿼리하여 **근거 기반(grounded)** 구현을 지원합니다.)

- **Purpose**: To fetch official documentation for external libraries to ensure up-to-date and accurate implementation.
- **Core Tools**: `resolve-library-id`, `get-library-docs`.
- **Example Workflow (SvelteKit Superforms)**:
  ```javascript
  resolve-library-id(libraryName="sveltekit-superforms")
  get-library-docs(context7CompatibleLibraryID="/svelte-superforms/sveltekit-superforms", topic="usage")
  ```

---

## 5. General Development Workflow & Rules

(This section contains general guidelines for the development process.)

- **Task-Driven Workflow**: Use the `list` -> `next` -> `show` -> `expand` -> `implement` -> `update-subtask` -> `set-status` loop.
- **VS Code Rules**: Follow the specified structure for creating and maintaining rules.
- **Continuous Improvement**: Update rules and patterns as the codebase evolves.


---

## 3. Sequential Thinking MCP Usage Server Guide

This server provides structured, step-by-step planning utilities ("sequential_thinking" tools) for breaking down complex tasks.

> If you expose it over HTTP/SSE instead, run the server locally with `--transport sse --port 9122` and set `{ "url": "http://localhost:9122/sse" }` instead of `command/args`.

### Verify inside Gemini
```bash
cd /Users/gim-yungi/RustroverProjects/tickettock/frontend
gemini
/mcp           # see 'sequential-thinking'
/tools         # tools merged; look for sequential_thinking.*
```

### Common tools & inputs
- `sequential_thinking.plan`  — inputs: `thought`, `nextThoughtNeeded` (bool), `thoughtNumber` (int)
- `sequential_thinking.reflect` — inputs: `thought`, `issues`

### Notes
- Keep this server stdio-based for lowest latency with Gemini CLI.
- Commit any reusable prompts to `.serena/memories/` or project docs for reuse.

---

## 4. Context7 Usage Server Guide

`context7` helps fetch **official documentation** of libraries/APIs for grounded implementation.

### Typical workflow
```text
resolve-library-id(libraryName="sveltekit-superforms")
get-library-docs(context7CompatibleLibraryID="/svelte-superforms/sveltekit-superforms", topic="usage")
```

### Notes
- Prefer remote SSE when multiple team members share the same doc index.
- Cache window and rate limits are enforced by the server; retry with a smaller topic if needed.

---

## 5. Playwright Usage Server Guide

E2E testing for this SvelteKit + TypeScript project.

### Install & scaffold (once)
```bash
cd /Users/gim-yungi/RustroverProjects/tickettock/frontend
npx sv add playwright
```
This adds Playwright config, scripts, and a demo test.

### Run tests
```bash
# Headless (CI default)
npx playwright test

# Headed (debug visually)
npx playwright test --headed

# Choose browser
npx playwright test --browser=chromium

# Reporter
npx playwright test --reporter=list

# Debug UI
PWDEBUG=1 npx playwright test
```
> Note: `--headed` is a Playwright flag, **not** a Vitest flag. Using it with Vitest will error.

### Useful files
- `playwright.config.ts`: tweak `use.baseURL`, timeouts, retries, and projects.
- `e2e/*.test.ts`: put your tests here.

---

## 6. Taskmaster ai Usage Server Guide

Taskmaster AI is used for project/task orchestration from the terminal.

### Core workflow
```bash
# Initialize in current repo (one time)
task-master init

# PRD → tasks
task-master parse-prd .taskmaster/docs/prd.txt

# Daily loop
task-master list
task-master next
task-master show 1.2
task-master expand 1.2
task-master set-status --id=1.2 --status=done
```

### SvelteKit-friendly tips
- Keep tasks tied to app routes (`src/routes/**/+page.svelte`, `+page.ts`, `+server.ts`).
- Add CI step to fail when open `critical` tasks exist.
- Attach E2E IDs (e.g., `data-testid`) early so Playwright scenarios are stable.

### Troubleshooting
- If tasks don't appear, re-parse PRD after structure changes.
- Keep `project_name` in `.serena/project.yml` aligned with your Taskmaster project label.