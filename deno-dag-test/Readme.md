# Deno Dag Test

## Overview

**Deno Dag Test** optimizes your development workflow by analyzing dependencies within your Deno projects. It intelligently executes only the relevant test cases based on changes in your codebase, significantly reducing testing time in large and complex projects.

## Features

- **Dependency Mapping**: Constructs a comprehensive dependency graph using `deno info`.
- **Selective Test Execution**: Runs only the tests affected by recent code changes.
- **Monorepo Support**: Efficiently handles multiple interdependent packages.
- **Immutable Data Structures**: Ensures data integrity with readonly interfaces.
- **Easy Integration**: Simple scripts to seamlessly integrate into your workflow.

## Usage

### 1. Check Staged Files and Run Relevant Tests

The primary feature of this tool is the ability to detect staged files in Git and run only the related tests. This is managed by the `checkStagedDagTests` function in `stagedDagTestRunner.ts`.

To use `checkStagedDagTests`, create a configuration object specifying the base folders to analyze, the test task to run, and any optional test flags.

```typescript
import { checkStagedDagTests } from "jsr:@staytuned/deno-dag-test";

const config = {
  baseFolders: ["src", "packages"], // Base directories to analyze
  testTask: "test", // The test task name (e.g., "test")
  testFlags: ["--allow-all"], // Optional test runner flags
};

const result = await checkStagedDagTests(config);
if (!result.ok) {
  console.error(result.error);
}
```

### 2. DagTestAnalyzer Class Integration

The `DagTestAnalyzer` class is the core component responsible for analyzing dependencies within your project.

#### **Importing the Class**

```typescript
import { DagTestAnalyzer } from "jsr:@staytuned/deno-dag-test";
```

#### **Initializing the Analyzer**

Provide entry points (directories or files) for analysis:

```typescript
const entryPoints = ["src", "packages"];
const analyzer = new DagTestAnalyzer(entryPoints);
```

#### **Methods**

- **getAllLocalDependencies**

  Retrieves all local dependencies.

  ```typescript
  const result = await analyzer.getAllLocalDependencies();
  if (result.ok) {
    console.log(result.value);
  } else {
    console.error(result.error);
  }
  ```

- **getDependentsOf**

  Finds all files dependent on a given file.

  ```typescript
  const dependents = await analyzer.getDependentsOf(
    "src/utils/helpers/stringUtils.ts",
  );
  if (dependents.ok) {
    console.log(dependents.value);
  } else {
    console.error(dependents.error);
  }
  ```

- **getRelatedTestFiles**

  Identifies related test files for changed files.

  ```typescript
  const testFiles = await analyzer.getRelatedTestFiles([
    "src/utils/helpers/stringUtils.ts",
  ]);
  if (testFiles.ok) {
    console.log(testFiles.value);
  } else {
    console.error(testFiles.error);
  }
  ```

#### **Example Integration**

Here's how you might integrate `DagTestAnalyzer` into a CLI script:

```typescript
import { DagTestAnalyzer } from "jsr:@staytuned/deno-dag-test";

const entryPoints = ["src", "packages"];
const analyzer = new DagTestAnalyzer(entryPoints);

const changedFiles = ["src/utils/helpers/stringUtils.ts"];
const testFilesResult = await analyzer.getRelatedTestFiles(changedFiles);

if (testFilesResult.ok) {
  console.log("Related test files:", testFilesResult.value);
  // Execute tests as needed
} else {
  console.error("Error:", testFilesResult.error);
}
```

## Example

### Step-by-Step Usage

1. **Initialize DagTestAnalyzer**

   ```typescript
   const analyzer = new DagTestAnalyzer([
     "project1/src",
     "project2/packages",
   ]);
   ```

2. **Find Dependents**

   ```typescript
   const dependents = await analyzer.getDependentsOf(
     "project1/src/utils/helpers/stringUtils.ts",
   );
   console.log(dependents.value);
   ```

3. **Run Related Tests**

   ```typescript
   const testFiles = await analyzer.getRelatedTestFiles([
     "project1/src/utils/helpers/stringUtils.ts",
   ]);
   if (testFiles.ok) {
     // Execute tests
   }
   ```

---

**Happy Coding!** 🚀
