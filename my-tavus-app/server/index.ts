import express, { Request, Response } from "express";
import cors from "cors";
import { runClaude } from "./claude-runner";

const app = express();
const PORT = 3001;

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["POST"],
}));

app.use(express.json());

interface ClaudeRequest {
  prompt: string;
}

app.post("/api/claude", async (req: Request<object, object, ClaudeRequest>, res: Response) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({ error: "Missing or invalid 'prompt' in request body" });
    return;
  }

  console.log(`[Claude API] Received prompt: ${prompt.substring(0, 100)}...`);

  const result = await runClaude(prompt);

  if (result.success) {
    console.log(`[Claude API] Success, output length: ${result.output.length}`);
    console.log(`[Claude API] Result:\n${result.output}`);
    console.log(`\n${"=".repeat(80)}\n`);
    res.json({ result: result.output });
  } else {
    console.error(`[Claude API] Error: ${result.error}`);
    console.error(`[Claude API] Output: ${result.output}`);
    res.status(500).json({
      error: result.error,
      output: result.output,
    });
  }
});

app.listen(PORT, () => {
  console.log(`[Claude API] Server running on http://localhost:${PORT}`);
});
