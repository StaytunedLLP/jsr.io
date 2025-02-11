/**
 * Module for checking and running tests impacted by staged changes in Git.
 * This module integrates with Git to identify staged files and runs relevant tests
 * using the DagTestAnalyzer.
 *
 * @example
 * ```typescript
 * // Run tests for staged files
 * const result = await checkStagedDagTests({
 *   baseFolders: ['src/domain', 'src/api'],
 *   testTask: 'test',
 *   testFlags: ['--allow-all']
 * });
 *
 * if (result.ok) {
 *   console.log('All tests passed!');
 * } else {
 *   console.error('Test execution failed:', result.error);
 * }
 * ```
 *
 * Can also be run from the command line:
 * ```bash
 * deno run check.ts src/domain,src/api test --allow-all
 * ```
 */

import {
  DagTestAnalyzer,
  getStagedFiles,
  runTests,
} from "@staytuned/deno-dag-test";

//#region Types
/**
 * Configuration for the test checker.
 */
export interface TestCheckerConfig {
  /** Base folders to analyze for dependencies */
  readonly baseFolders: ReadonlyArray<string>;
  /** Name of the Deno task to run tests */
  readonly testTask: string;
  /** Optional flags to pass to the test task */
  readonly testFlags?: ReadonlyArray<string>;
}

type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };
//#endregion

//#region Main Function
/**
 * Checks staged files and runs dag tests.
 *
 * @param config - Test checker configuration
 * @returns Promise resolving to a Result indicating success or failure
 *
 * @example
 * ```typescript
 * // Run tests for staged files
 * const result = await checkStagedDagTests({
 *   baseFolders: ['src/domain', 'src/api'],
 *   testTask: 'test',
 *   testFlags: ['--allow-all']
 * });
 *
 * if (!result.ok) {
 *   console.error('Failed to run tests:', result.error);
 *   Deno.exit(1);
 * }
 * ```
 */
export const checkStagedDagTests = async (
  config: TestCheckerConfig,
): Promise<Result<void, Error>> => {
  try {
    const stagedFiles = await getStagedFiles();
    const currentWorkingDirectory = Deno.cwd();

    if (stagedFiles.length === 0) {
      console.log("No files are staged for commit.");
      return { ok: true, value: undefined };
    }

    const analyzer = new DagTestAnalyzer(config.baseFolders);

    const normalizedStagedFiles = stagedFiles.map((file) => {
      const currentFolder = currentWorkingDirectory.split("/").pop();
      const fileParts = file.split("/");
      const index = fileParts.indexOf(currentFolder as string);
      return index === -1 ? file : fileParts.slice(index + 1).join("/");
    });

    const impactedTestFilesResult = await analyzer.getRelatedTestFiles( // Note: Keeping `getRelatedTestFiles` as it refers to test files, not the analyzer itself.
      normalizedStagedFiles,
    );
    if (!impactedTestFilesResult.ok) {
      return impactedTestFilesResult;
    }

    await runTests(
      impactedTestFilesResult.value,
      config.testTask,
      config.testFlags ?? [],
    );

    return { ok: true, value: undefined };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};
//#endregion

//#region CLI Entry Point
if (import.meta.main) {
  const [baseFoldersArg, testTask, ...testFlags] = Deno.args;

  if (!baseFoldersArg || !testTask) {
    console.error(
      "Usage: deno run test_checker.ts <base-folders> <test-task> [...test-flags]",
    );
    console.error(
      "Example: deno run test_checker.ts src/domain,src/api test --allow-all",
    );
    Deno.exit(1);
  }

  const baseFolders = baseFoldersArg.split(",");
  const result = await checkStagedDagTests({
    baseFolders,
    testTask,
    testFlags,
  });

  if (!result.ok) {
    console.error("Error:", result.error.message);
    Deno.exit(1);
  }
}
//#endregion
