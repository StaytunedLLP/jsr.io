import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { runTests } from "../utils/testRunner.ts";

describe("runTests", () => {
  it("should log a message if no test files are provided", async () => {
    const consoleLog = console.log;
    let logMessage = "";
    console.log = (message: string) => logMessage = message;

    await runTests([], "testTask");

    assertEquals(logMessage, "No related test files found.");

    console.log = consoleLog;
  });

  it("should run tests for the provided test files", async () => {
    const consoleLog = console.log;
    const consoleError = console.error;
    const logMessages: string[] = [];
    const errorMessages: string[] = [];
    console.log = (message: string) => logMessages.push(message);
    console.error = (message: string) => errorMessages.push(message);

    // Mock the command output to simulate test run
    const originalCommand = Deno.Command;
    Deno.Command = function () {
      return {
        output: () => ({
          stdout: new TextEncoder().encode("Test output"),
          stderr: new TextEncoder().encode("Test error output"),
        }),
      };
    } as unknown as typeof Deno.Command;

    await runTests(["testFile1.ts", "testFile2.ts"], "testTask");

    assertEquals(
      logMessages.includes("Running tests for impacted files:"),
      true,
    );
    assertEquals(logMessages.includes("- testFile1.ts"), true);
    assertEquals(logMessages.includes("- testFile2.ts"), true);
    assertEquals(logMessages.includes("Test output"), true);
    assertEquals(errorMessages.includes("Test error output"), true);

    console.log = consoleLog;
    console.error = consoleError;
    Deno.Command = originalCommand;
  });
});
