# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run both frontend and backend
npm run dev

# Frontend only (from app/)
npm run dev --prefix app

# Backend only
npx tsx server/index.ts

# Build/lint (from app/)
npm run build --prefix app
npm run lint --prefix app
```

## Architecture

This app integrates Tavus Conversational Video Interface (CVI) with Claude Code, enabling a video avatar to execute development tasks via voice commands.

**Data flow:**
```
User speaks → Tavus AI → tool_call event → useToolCalls hook
    → POST /api/claude → claude-runner spawns Claude CLI
    → response → conversation.echo → Avatar speaks result
```

**Key files:**
- `app/src/hooks/use-tool-calls.ts` - Listens for `conversation.tool_call` events from Daily, calls backend, sends results back via `conversation.echo`
- `app/src/components/cvi/` - Auto-generated Tavus CVI components (use `npx @tavus/cvi-ui@latest` to manage)
- `server/index.ts` - Express server exposing `POST /api/claude`
- `server/claude-runner.ts` - Spawns Claude Code CLI with `execSync`, 5-minute timeout, runs in `/Users/seanhall/vault`

**State management:** Jotai atoms in CVI hooks, React useState in App.tsx

## Environment Variables

Required in `app/.env`:
```
VITE_TAVUS_API_KEY=your_api_key
VITE_REPLICA_ID=your_replica_id
VITE_PERSONA_ID=your_persona_id
```

The Tavus persona must have the `run_claude_code` tool configured (see README.md for schema).

## TypeScript

Avoid "lazy" types (`any`, `undefined`, `unknown`) unless absolutely necessary.
