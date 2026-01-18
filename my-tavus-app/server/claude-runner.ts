import { execSync } from "child_process";

interface ClaudeResult {
  success: boolean;
  output: string;
  error?: string;
}

export async function runClaude(prompt: string): Promise<ClaudeResult> {
  const workingDir = "/Users/seanhall/vault";
  const claudePath = "/Users/seanhall/.local/bin/claude";

  // Escape single quotes in prompt for shell
  const escapedPrompt = prompt.replace(/'/g, "'\\''");
  const command = `${claudePath} -p '${escapedPrompt}'`;

  console.log(`[Claude Runner] Executing: ${command}`);

  try {
    const output = execSync(command, {
      cwd: workingDir,
      encoding: "utf-8",
      timeout: 300000, // 5 minute timeout
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    console.log(`[Claude Runner] Success, output length: ${output.length}`);
    return {
      success: true,
      output: output.trim(),
    };
  } catch (err) {
    const error = err as { message: string; stdout?: string; stderr?: string };
    console.error(`[Claude Runner] Error: ${error.message}`);
    return {
      success: false,
      output: error.stdout || "",
      error: error.stderr || error.message,
    };
  }
}
