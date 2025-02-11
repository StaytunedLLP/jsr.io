import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { getStagedFiles } from "../utils/gitUtils.ts";

describe("getStagedFiles", () => {
  it("should return an array of staged files", async () => {
    const stagedFiles = await getStagedFiles();
    assertEquals(Array.isArray(stagedFiles), true);
  });

  it("should return an empty array if no files are staged", async () => {
    // Mock the command output to simulate no staged files
    const originalCommand = Deno.Command;
    Deno.Command = function () {
      return {
        output: () => ({
          stdout: new TextEncoder().encode(""),
          stderr: new Uint8Array(),
        }),
      };
    } as unknown as typeof Deno.Command;

    const stagedFiles = await getStagedFiles();
    assertEquals(stagedFiles.length, 0);

    // Restore the original command
    Deno.Command = originalCommand;
  });
});
