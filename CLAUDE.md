# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run both frontend and backend together
npm run dev:all

# Run frontend only (Vite dev server on port 5173)
npm run dev

# Run backend only (Express server on port 3001)
npm run server

# Build for production
npm run build

# Lint
npm run lint
```

All commands run from `my-tavus-app/`.

## Architecture

This app integrates Tavus Conversational Video Interface (CVI) with Claude Code, enabling a video avatar to execute development tasks via voice commands.

**Data flow:**
```
User speaks → Tavus AI → tool_call event → useToolCalls hook
    → POST /api/claude → claude-runner spawns Claude CLI
    → response → conversation.echo → Avatar speaks result
```

**Key files:**
- `src/hooks/use-tool-calls.ts` - Listens for `conversation.tool_call` events from Daily, calls backend, sends results back via `conversation.echo`
- `server/claude-runner.ts` - Spawns Claude Code CLI with `execSync`, 5-minute timeout, runs in `/Users/seanhall/vault`
- `server/index.ts` - Express server exposing `POST /api/claude`
- `src/components/cvi/` - Auto-generated Tavus CVI components (use `npx @tavus/cvi-ui@latest` to manage)

**State management:** Jotai atoms in CVI hooks, React useState in App.tsx

## Environment Variables

Required in `.env`:
```
VITE_TAVUS_API_KEY=your_api_key
VITE_REPLICA_ID=your_replica_id
VITE_PERSONA_ID=your_persona_id
```

The Tavus persona must have the `run_claude_code` tool configured (see README.md for schema).

## TypeScript

Avoid "lazy" types (`any`, `undefined`, `unknown`) unless absolutely necessary.
