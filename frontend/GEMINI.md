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

### Development Commands

**Essential Commands (use these exact commands):**
- `uv run poe format`: Format code (BLACK + RUFF).
- `uv run poe type-check`: Run mypy type checking.
- `uv run poe test`: Run tests with default markers.
- `uv run poe lint`: Check code style without fixing.

### Project Management

- `uv run serena-mcp-server`: Start the Serena MCP server from the project root.
- `uv run index-project`: Index the project for faster tool performance.

**Always run format, type-check, and test before completing any task.**

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