import { useEffect, useCallback } from "react";
import { useDaily } from "@daily-co/daily-react";

interface ToolCallEvent {
  message_type: string;
  event_type: string;
  conversation_id: string;
  inference_id: string;
  properties: {
    name: string;
    arguments: string;
  };
}

interface ToolCallArguments {
  prompt: string;
}

async function callClaudeAPI(prompt: string): Promise<string> {
  const response = await fetch("http://localhost:3001/api/claude", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to call Claude API");
  }

  return data.result;
}

export function useToolCalls() {
  const daily = useDaily();

  const handleToolCall = useCallback(
    async (event: ToolCallEvent) => {
      console.log("[Tool Call] Received:", event.properties.name);

      if (event.properties.name === "run_claude_code") {
        try {
          const args: ToolCallArguments = JSON.parse(event.properties.arguments);
          console.log("[Tool Call] Prompt:", args.prompt);

          const result = await callClaudeAPI(args.prompt);
          console.log("[Tool Call] Result:", result.substring(0, 200));

          // Truncate result if too long for speech
          const truncatedResult = result.length > 2000
            ? result.substring(0, 2000) + "... (truncated)"
            : result;

          // Send the result back to Tavus using conversation.echo
          // This tells the replica exactly what to say
          daily?.sendAppMessage(
            {
              message_type: "conversation",
              event_type: "conversation.echo",
              conversation_id: event.conversation_id,
              properties: {
                text: `Here's what I found: ${truncatedResult}`,
              },
            },
            "*"
          );

          console.log("[Tool Call] Result sent back to Tavus via echo");
        } catch (error) {
          console.error("[Tool Call] Error:", error);

          // Send error result back to Tavus
          daily?.sendAppMessage(
            {
              message_type: "conversation",
              event_type: "conversation.echo",
              conversation_id: event.conversation_id,
              properties: {
                text: `I encountered an error while running Claude Code: ${error instanceof Error ? error.message : "Unknown error"}`,
              },
            },
            "*"
          );
        }
      }
    },
    [daily]
  );

  useEffect(() => {
    if (!daily) return;

    const handleAppMessage = (event: { data: ToolCallEvent; fromId: string }) => {
      const { data } = event;

      if (data.event_type === "conversation.tool_call") {
        handleToolCall(data);
      }
    };

    daily.on("app-message", handleAppMessage);

    return () => {
      daily.off("app-message", handleAppMessage);
    };
  }, [daily, handleToolCall]);
}
