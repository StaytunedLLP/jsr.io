export const getStagedFiles = async (): Promise<ReadonlyArray<string>> => {
  const command = new Deno.Command("git", {
    args: ["diff", "--cached", "--name-only", "--diff-filter=ACMR"],
    stdout: "piped",
  });

  const { stdout } = await command.output();
  const gitOutput = new TextDecoder().decode(stdout);
  return gitOutput.trim().split("\n").filter(Boolean);
};
