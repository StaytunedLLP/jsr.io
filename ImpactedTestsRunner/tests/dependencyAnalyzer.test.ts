import { ImpactedTestAnalyzer } from "../dependencyAnalyzer.ts";
import { main as createMockProjects } from "./createProject.ts";
import { resolve } from "@std/path";
import { assertEquals } from "@std/assert";
import { afterAll, beforeAll, describe, it } from "@std/testing/bdd";

describe("ImpactedTestAnalyzer", () => {
  let analyzerProject1: ImpactedTestAnalyzer;
  let analyzerProject2: ImpactedTestAnalyzer;

  beforeAll(async () => {
    await createMockProjects();
    analyzerProject1 = new ImpactedTestAnalyzer(["project1"]);
    const initResult1 = await analyzerProject1["initializationPromise"];
    if (!initResult1.ok) {
      throw initResult1.error;
    }

    analyzerProject2 = new ImpactedTestAnalyzer(["project2"]);
    const initResult2 = await analyzerProject2["initializationPromise"];
    if (!initResult2.ok) {
      throw initResult2.error;
    }
  });

  describe("Project 1", () => {
    afterAll(async () => {
      await Deno.remove("project1", { recursive: true });
    });

    it("should get all local dependencies", async () => {
      const dependenciesResult = await analyzerProject1
        .getAllLocalDependencies();
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

  describe("Project 2", () => {
    afterAll(async () => {
      await Deno.remove("project2", { recursive: true });
    });

    it("should get all local dependencies", async () => {
      const dependenciesResult = await analyzerProject2
        .getAllLocalDependencies();
      if (dependenciesResult.ok) {
        assertEquals(Array.isArray(dependenciesResult.value), true);
        assertEquals(dependenciesResult.value.length > 0, true);
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

    it("should find dependents of a cross-package file", async () => {
      const filePath = resolve(
        "project2/packages/data-services/src/database/connection.ts",
      );
      const relativePath = filePath.replace(`${Deno.cwd()}/`, "");

      const dependentsResult = await analyzerProject2.getDependentsOf(
        relativePath,
      );
      if (dependentsResult.ok) {
        const expectedDependents = [
          "project2/packages/data-services/src/database/tests/connection_test.ts",
        ];
        expectedDependents.map((file) => {
          assertEquals(dependentsResult.value.includes(file), true);
        });
      } else {
        throw dependentsResult.error;
      }
    });

    it("should handle errors when finding dependents of a cross-package file", async () => {
      const faultyAnalyzer = new ImpactedTestAnalyzer(["nonexistent"]);
      const dependentsResult = await faultyAnalyzer.getDependentsOf(
        "nonexistent/path.ts",
      );
      assertEquals(dependentsResult.ok, false);
      if (!dependentsResult.ok) {
        assertEquals(dependentsResult.error instanceof Error, true);
      }
    });

    it("should find related test files for changed features across packages", async () => {
      const changedFiles = ["project2/packages/core/src/utils/coreUtils.ts"];
      const testFilesResult = await analyzerProject2.getRelatedTestFiles(
        changedFiles,
      );
      if (testFilesResult.ok) {
        const expectedTestFiles = [
          "project2/packages/core/src/tests/coreUtils_test.ts",
          "project2/packages/core/src/tests/core_test.ts",
          "project2/packages/ui-components/src/button/tests/button_test.ts",
          "project2/packages/data-services/src/database/tests/connection_test.ts",
          "project2/packages/ui-components/src/modal/tests/modal_test.ts",
        ];
        expectedTestFiles.map((file) => {
          assertEquals(testFilesResult.value.includes(file), true);
        });
      } else {
        throw testFilesResult.error;
      }
    });

    it("should handle errors when finding related test files for changed features across packages", async () => {
      const faultyAnalyzer = new ImpactedTestAnalyzer(["nonexistent"]);
      const testFilesResult = await faultyAnalyzer.getRelatedTestFiles([
        "nonexistent/path.ts",
      ]);
      assertEquals(testFilesResult.ok, false);
      if (!testFilesResult.ok) {
        assertEquals(testFilesResult.error instanceof Error, true);
      }
    });

    it("should handle errors during initialization", async () => {
      const faultyAnalyzer = new ImpactedTestAnalyzer(["nonexistent"]);
      const initResult = await faultyAnalyzer["initializationPromise"];
      assertEquals(initResult.ok, false);
      if (!initResult.ok) {
        assertEquals(initResult.error instanceof Error, true);
      }
    });

    it("should handle errors when resolving entry points", async () => {
      const faultyAnalyzer = new ImpactedTestAnalyzer(["nonexistent"]);
      const resolveEntryPoints = faultyAnalyzer["resolveEntryPoints"].bind(
        faultyAnalyzer,
      );
      try {
        await resolveEntryPoints(["nonexistent"]);
      } catch (error) {
        assertEquals(error instanceof Error, true);
      }
    });

    it("should handle errors when building dependency map", () => {
      const faultyGraph = {
        version: 1,
        roots: [],
        modules: [],
      };
      const faultyAnalyzer = new ImpactedTestAnalyzer(["nonexistent"]);
      const buildDependencyMap = faultyAnalyzer["buildDependencyMap"].bind(
        faultyAnalyzer,
      );
      try {
        buildDependencyMap(faultyGraph);
      } catch (error) {
        assertEquals(error instanceof Error, true);
      }
    });

    it("should handle errors when collecting related test files", async () => {
      const faultyAnalyzer = new ImpactedTestAnalyzer(["nonexistent"]);
      const collectRelatedTestFiles = faultyAnalyzer["collectRelatedTestFiles"]
        .bind(faultyAnalyzer);
      try {
        await collectRelatedTestFiles(["nonexistent"]);
      } catch (error) {
        assertEquals(error instanceof Error, true);
      }
    });

    it("should handle errors when getting dependents of a file", async () => {
      const faultyAnalyzer = new ImpactedTestAnalyzer(["nonexistent"]);
      const getDependentsOf = faultyAnalyzer.getDependentsOf.bind(
        faultyAnalyzer,
      );
      const result = await getDependentsOf("nonexistent/path.ts");
      assertEquals(result.ok, false);
      if (!result.ok) {
        assertEquals(result.error instanceof Error, true);
      }
    });
  });
});
