export const runTests = async (
  testFiles: ReadonlyArray<string>,
  testTask: string,
  testFlags: ReadonlyArray<string> = [],
): Promise<void> => {
  if (testFiles.length === 0) {
    console.log("No related test files found.");
    return;
  }

  console.log("Running tests for impacted files:");
  testFiles.forEach((file) => console.log(`- ${file}`));

  const command = new Deno.Command("deno", {
    args: ["task", testTask, ...testFlags, ...testFiles],
    stdout: "piped",
    stderr: "piped",
  });

  const { stdout, stderr } = await command.output();
  const testOutput = new TextDecoder().decode(stdout);
  const testErrorOutput = new TextDecoder().decode(stderr);

  console.log(testOutput);
  console.error(testErrorOutput);
};
