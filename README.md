# Tavus CVI + Claude Code Integration

A web app that embeds Tavus's Conversational Video Interface (CVI) with an AI avatar that can execute tasks via Claude Code.

## What It Does

- Video conversation with an AI avatar powered by Tavus
- The avatar can call Claude Code to perform development tasks, read/write files, and interact with your Obsidian vault
- Results are spoken back by the avatar

## Architecture

```
User speaks → Tavus AI decides to call tool → Frontend receives tool_call event
    → Frontend calls backend API → Backend spawns Claude Code CLI
    → Claude Code executes task → Backend returns output → Frontend sends result to Tavus
    → Avatar speaks the result
```

## Project Structure

```
├── app/                        # Frontend (Vite + React)
│   ├── src/
│   │   ├── App.tsx             # Main app - creates conversation, renders UI
│   │   ├── hooks/
│   │   │   └── use-tool-calls.ts   # Listens for tool calls, calls backend, sends results
│   │   └── components/cvi/     # Tavus CVI components (auto-generated)
│   └── .env                    # API keys and config
├── server/                     # Backend (Express)
│   ├── index.ts                # Express server on port 3001
│   └── claude-runner.ts        # Spawns Claude Code CLI subprocess
└── README.md
```

## Setup

1. Install dependencies:
   ```bash
   npm install && npm install --prefix app
   ```

2. Configure `app/.env`:
   ```
   VITE_TAVUS_API_KEY=your_api_key
   VITE_REPLICA_ID=your_replica_id
   VITE_PERSONA_ID=your_persona_id
   ```

3. Ensure your Tavus persona has the `run_claude_code` tool configured.

## Running

```bash
npm run dev
```

This starts both frontend (port 5173) and backend (port 3001).

## Usage

1. Open http://localhost:5173
2. Click "Start Conversation"
3. Allow camera/microphone access
4. Ask the avatar to perform tasks like:
   - "What's on my to-do list?"
   - "Add milk to my shopping list"
   - "Search for files containing X"

## Configuration

The Claude Code subprocess runs in `/Users/seanhall/vault` with access to CLAUDE.md instructions and the Obsidian vault.

To change the working directory, edit `server/claude-runner.ts`.

## Tavus Persona Tool Definition

The persona needs this tool configured:

```json
{
  "type": "function",
  "function": {
    "name": "run_claude_code",
    "description": "Execute a task using Claude Code AI assistant.",
    "parameters": {
      "type": "object",
      "properties": {
        "prompt": {
          "type": "string",
          "description": "The task or question to send to Claude Code"
        }
      },
      "required": ["prompt"]
    }
  }
}
```
