import { ImpactedTestAnalyzer } from "../../dependencyAnalyzer.ts";
import { main as createMockProjects } from "../createProject.ts";
import { resolve } from "@std/path";
import { assertEquals } from "@std/assert";
import { afterAll, beforeAll, describe, it } from "@std/testing/bdd";

describe("ImpactedTestAnalyzer - Project 1", () => {
  let analyzerProject1: ImpactedTestAnalyzer;

  beforeAll(async () => {
    await createMockProjects();
    analyzerProject1 = new ImpactedTestAnalyzer(["project1"]);
    const initResult1 = await analyzerProject1["initializationPromise"];
    if (!initResult1.ok) {
      throw initResult1.error;
    }
  });

  afterAll(async () => {
    await Deno.remove("project1", { recursive: true });
  });

  it("should get all local dependencies", async () => {
    const dependenciesResult = await analyzerProject1.getAllLocalDependencies();
    if (dependenciesResult.ok) {
      assertEquals(Array.isArray(dependenciesResult.value), true);
      const expectedDependencies = [
        "project1/src/components/header/helpers/layoutHelper.ts",
        "project1/src/components/header/index.ts",
        "project1/src/components/header/tests/header_test.ts",
        "project1/src/components/header/tests/layoutHelper_test.ts",
        "project1/src/components/sidebar/index.ts",
        "project1/src/components/sidebar/tests/sidebar_test.ts",
        "project1/src/services/auth/login.ts",
        "project1/src/services/auth/tests/auth_test.ts",
        "project1/src/services/auth/tests/login_test.ts",
        "project1/src/utils/tests/stringUtils_test.ts",
      ];
      expectedDependencies.map((file) => {
        assertEquals(dependenciesResult.value.includes(file), true);
      });
    } else {
      throw dependenciesResult.error;
    }
  });

  it("should handle errors when getting all local dependencies", async () => {
    const faultyAnalyzer = new ImpactedTestAnalyzer(["nonexistent"]);
    const dependenciesResult = await faultyAnalyzer.getAllLocalDependencies();
    assertEquals(dependenciesResult.ok, false);
    if (!dependenciesResult.ok) {
      assertEquals(dependenciesResult.error instanceof Error, true);
    }
  });

  it("should find dependents of a file", async () => {
    const filePath = resolve("project1/src/utils/helpers/stringUtils.ts");
    const relativePath = filePath.replace(`${Deno.cwd()}/`, "");

    const dependentsResult = await analyzerProject1.getDependentsOf(
      relativePath,
    );
    if (dependentsResult.ok) {
      const expectedDependents = [
        "project1/src/components/header/helpers/layoutHelper.ts",
        "project1/src/components/header/index.ts",
        "project1/src/components/header/tests/layoutHelper_test.ts",
        "project1/src/components/header/tests/header_test.ts",
        "project1/src/services/auth/login.ts",
        "project1/src/components/sidebar/index.ts",
        "project1/src/components/sidebar/tests/sidebar_test.ts",
        "project1/src/services/auth/tests/auth_test.ts",
        "project1/src/services/auth/tests/login_test.ts",
        "project1/src/utils/tests/stringUtils_test.ts",
      ];
      expectedDependents.map((file) => {
        assertEquals(dependentsResult.value.includes(file), true);
      });
    } else {
      throw dependentsResult.error;
    }
  });

  it("should handle errors when finding dependents of a file", async () => {
    const faultyAnalyzer = new ImpactedTestAnalyzer(["nonexistent"]);
    const dependentsResult = await faultyAnalyzer.getDependentsOf(
      "nonexistent/path.ts",
    );
    assertEquals(dependentsResult.ok, false);
    if (!dependentsResult.ok) {
      assertEquals(dependentsResult.error instanceof Error, true);
    }
  });

  it("should find related test files for changed features", async () => {
    const changedFiles = ["project1/src/utils/helpers/stringUtils.ts"];
    const testFilesResult = await analyzerProject1.getRelatedTestFiles(
      changedFiles,
    );
    if (testFilesResult.ok) {
      const expectedTestFiles = [
        "project1/src/components/header/tests/layoutHelper_test.ts",
        "project1/src/components/header/tests/header_test.ts",
        "project1/src/utils/tests/stringUtils_test.ts",
        "project1/src/components/sidebar/tests/sidebar_test.ts",
        "project1/src/services/auth/tests/auth_test.ts",
        "project1/src/services/auth/tests/login_test.ts",
      ];
      expectedTestFiles.map((file) => {
        assertEquals(testFilesResult.value.includes(file), true);
      });
    } else {
      throw testFilesResult.error;
    }
  });

  it("should handle errors when finding related test files for changed features", async () => {
    const faultyAnalyzer = new ImpactedTestAnalyzer(["nonexistent"]);
    const testFilesResult = await faultyAnalyzer.getRelatedTestFiles([
      "nonexistent/path.ts",
    ]);
    assertEquals(testFilesResult.ok, false);
    if (!testFilesResult.ok) {
      assertEquals(testFilesResult.error instanceof Error, true);
    }
  });
});
