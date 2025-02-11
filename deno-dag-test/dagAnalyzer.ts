/**
 * Module for analyzing dependencies between TypeScript files and finding dag test files.
 * This module provides functionality to analyze dependency relationships and identify test files
 * that need to be run based on changes to source files.
 *
 * @example
 * ```typescript
 * // Initialize the analyzer with source directories
 * const analyzer = new DagTestAnalyzer(['src/domain', 'src/api']);
 *
 * // Get test files impacted by changes
 * const result = await analyzer.getRelatedTestFiles(['src/domain/user/userService.ts']);
 * if (result.ok) {
 *   const testFiles = result.value;
 *   console.log('Test files to run:', testFiles);
 *   // Output: ['src/domain/user/__tests__/userService.test.ts', ...]
 * }
 *
 * // Get all local dependencies
 * const depsResult = await analyzer.getAllLocalDependencies();
 * if (depsResult.ok) {
 *   console.log('All local dependencies:', depsResult.value);
 * }
 * ```
 */

export interface DependencyNode {
  /** Module specifier (import path) */
  readonly specifier: string;
  /** Local file system path */
  readonly local?: string;
  /** Array of module dependencies */
  readonly dependencies?: ReadonlyArray<string>;
  /** Set of modules that depend on this module */
  readonly dependents?: Set<string>;
  /** Whether the file is a test file */
  readonly isTestFile?: boolean;
}

export interface Dependency {
  readonly specifier: string;
  readonly code?: Readonly<{
    specifier: string;
    span?: Readonly<{
      start: Readonly<{ line: number; character: number }>;
      end: Readonly<{ line: number; character: number }>;
    }>;
  }>;
  readonly type?: Readonly<{
    specifier: string;
    span?: Readonly<{
      start: Readonly<{ line: number; character: number }>;
      end: Readonly<{ line: number; character: number }>;
    }>;
  }>;
}

export interface DependencyGraph {
  readonly version: number;
  readonly roots: ReadonlyArray<string>;
  readonly modules: ReadonlyArray<{
    readonly kind: string;
    readonly dependencies?: ReadonlyArray<Dependency>;
    readonly local?: string;
    readonly size: number;
    readonly mediaType: string;
    readonly specifier: string;
  }>;
}

type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

import { fromFileUrl, join, relative, resolve } from "@std/path";
import { walk } from "@std/fs";

/**
 * Analyzer class that identifies test files impacted by changes in source files.
 * Uses Deno's module graph to build a dependency map and track relationships
 * between source and test files.
 */
export class DagTestAnalyzer {
  private readonly dependencyMap: Map<string, DependencyNode> = new Map();
  private readonly initializationPromise: Promise<Result<void, Error>>;
  private readonly baseDir: string;

  /**
   * Creates an instance of DagTestAnalyzer.
   *
   * @param entryPoints - Array of entry point directories or files to analyze
   *
   * @example
   * ```typescript
   * const analyzer = new DagTestAnalyzer(['src/domain', 'src/api']);
   * ```
   */
  constructor(entryPoints: ReadonlyArray<string>) {
    this.baseDir = Deno.cwd();
    this.initializationPromise = this.initialize(entryPoints);
  }

  private static isTestFile(filePath: string): boolean {
    const lowerPath = filePath.toLowerCase();
    return (
      lowerPath.includes(".test.") ||
      lowerPath.includes("__tests__") ||
      lowerPath.includes(".spec.") ||
      lowerPath.endsWith("_test.ts") ||
      lowerPath.endsWith(".test.ts")
    );
  }

  private static createDependencyNode(
    specifier: string,
    localPath: string,
    isTestFile: boolean,
  ): DependencyNode {
    return {
      specifier,
      local: localPath,
      dependencies: [],
      dependents: new Set<string>(),
      isTestFile,
    };
  }

  private async initialize(
    entryPoints: ReadonlyArray<string>,
  ): Promise<Result<void, Error>> {
    try {
      const resolvedEntryFiles = await this.resolveEntryPoints(entryPoints);

      const graphResult = await this.getDependencyGraph(resolvedEntryFiles);
      if (!graphResult.ok) return graphResult;

      this.buildDependencyMap(graphResult.value);

      console.log("DagTestAnalyzer initialized successfully.");
      return { ok: true, value: void 0 };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  private async resolveEntryPoints(
    entryPoints: ReadonlyArray<string>,
  ): Promise<string[]> {
    const files: string[] = [];

    const statPromises = entryPoints.map(async (entry) => {
      const fullPath = resolve(this.baseDir, entry);
      const stat = await Deno.stat(fullPath);
      if (stat.isDirectory) {
        for await (
          const entry of walk(fullPath, {
            includeFiles: true,
            exts: [".ts", ".tsx"],
          })
        ) {
          files.push(entry.path);
        }
      } else if (stat.isFile) {
        if (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx")) {
          files.push(fullPath);
        }
      }
    });

    await Promise.all(statPromises);

    return files;
  }

  private async getDependencyGraph(
    entryPoints: ReadonlyArray<string>,
  ): Promise<Result<DependencyGraph, Error>> {
    try {
      const tempModulePath = join(
        this.baseDir,
        ".temp_dependency_analyzer_entrypoint.ts",
      );
      const importStatements = entryPoints
        .map((file) => `import "${file}";`)
        .join("\n");
      await Deno.writeTextFile(tempModulePath, importStatements);

      const command = new Deno.Command("deno", {
        args: [
          "info",
          "--json",
          tempModulePath,
          "--no-remote",
          "--no-npm",
        ],
        stdout: "piped",
        stderr: "piped",
      });

      const { stdout, stderr } = await command.output();
      const output = new TextDecoder().decode(stdout);
      const errorOutput = new TextDecoder().decode(stderr).trim();

      if (errorOutput) {
        throw new Error(`Error running deno info: ${errorOutput}`);
      }

      const parsedGraph = JSON.parse(output) as DependencyGraph;

      if (!parsedGraph.modules) {
        throw new Error(
          `Malformed dependency graph: Missing 'modules' field.`,
        );
      }

      await Deno.remove(tempModulePath);

      return { ok: true, value: parsedGraph };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  private buildDependencyMap(graph: DependencyGraph): void {
    for (const module of graph.modules) {
      if (module.local) {
        const relativeModulePath = relative(this.baseDir, module.local);
        if (!this.dependencyMap.has(relativeModulePath)) {
          const isTestFile = DagTestAnalyzer.isTestFile(
            relativeModulePath,
          );
          this.dependencyMap.set(
            relativeModulePath,
            DagTestAnalyzer.createDependencyNode(
              module.specifier,
              relativeModulePath,
              isTestFile,
            ),
          );
        }
      }
    }

    for (const module of graph.modules) {
      if (module.dependencies && module.local) {
        const moduleLocalPath = relative(this.baseDir, module.local);
        for (const dep of module.dependencies) {
          const dependencySpecifier = dep.code?.specifier;
          if (
            dependencySpecifier &&
            dependencySpecifier.startsWith("file://")
          ) {
            const dependencyFullPath = fromFileUrl(dependencySpecifier);
            const dependencyRelativePath = relative(
              this.baseDir,
              dependencyFullPath,
            );
            const dependentNode = this.dependencyMap.get(
              dependencyRelativePath,
            );

            if (dependentNode) {
              dependentNode.dependents?.add(moduleLocalPath);
            }
          }
        }
      }
    }
  }

  /**
   * Gets all test files that are impacted by changes to the specified files.
   *
   * @param changedFiles - Array of file paths that have been changed
   * @returns Promise resolving to a Result containing an array of test file paths
   *
   * @example
   * ```typescript
   * const result = await analyzer.getRelatedTestFiles([
   *   'src/domain/user/userService.ts',
   *   'src/domain/auth/authService.ts'
   * ]);
   *
   * if (result.ok) {
   *   const testFiles = result.value;
   *   // ['src/domain/user/__tests__/userService.test.ts', ...]
   * }
   * ```
   */
  public async getRelatedTestFiles(
    changedFiles: ReadonlyArray<string>,
  ): Promise<Result<ReadonlyArray<string>, Error>> {
    try {
      const initResult = await this.initializationPromise;
      if (!initResult.ok) return initResult;

      const testFiles = await this.collectRelatedTestFiles(
        changedFiles,
      );
      return { ok: true, value: Array.from(testFiles) };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  private async collectRelatedTestFiles(
    changedFiles: ReadonlyArray<string>,
  ): Promise<ReadonlySet<string>> {
    const testFiles = new Set<string>();
    const visitedModules = new Set<string>();

    const collectDependents = async (path: string): Promise<void> => {
      if (visitedModules.has(path)) return;
      visitedModules.add(path);

      const dependentsResult = await this.getDependentsOf(path);
      if (!dependentsResult.ok) throw dependentsResult.error;

      await Promise.all(
        dependentsResult.value.map(async (dependent) => {
          if (DagTestAnalyzer.isTestFile(dependent)) {
            testFiles.add(dependent);
          } else {
            await collectDependents(dependent);
          }
        }),
      );
    };

    await Promise.all(changedFiles.map(collectDependents));
    return testFiles;
  }

  public async getAllLocalDependencies(): Promise<
    Result<ReadonlyArray<string>, Error>
  > {
    try {
      const initResult = await this.initializationPromise;
      if (!initResult.ok) return initResult;

      return { ok: true, value: Array.from(this.dependencyMap.keys()) };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Gets all modules that depend on the specified module.
   *
   * @param path - Path to the module
   * @returns Promise resolving to a Result containing an array of dependent module paths
   *
   * @example
   * ```typescript
   * const result = await analyzer.getDependentsOf('src/domain/user/userService.ts');
   *
   * if (result.ok) {
   *   const dependents = result.value;
   *   // ['src/domain/auth/authService.ts', 'src/domain/user/userProfile.ts', ...]
   * }
   * ```
   */
  public async getDependentsOf(
    path: string,
  ): Promise<Result<ReadonlyArray<string>, Error>> {
    const collectAllNestedDependents = async (
      path: string,
      visitedModules: Set<string> = new Set(),
    ): Promise<ReadonlyArray<string>> => {
      if (visitedModules.has(path)) return [];
      visitedModules.add(path);

      const node = this.dependencyMap.get(path);
      if (!node) return [];

      const directDependents = Array.from(node.dependents || []);
      const allDependents = await Promise.all(
        directDependents.map(async (dependent) => {
          const nestedDependents = await collectAllNestedDependents(
            dependent,
            visitedModules,
          );
          return [dependent, ...nestedDependents];
        }),
      );

      return Array.from(new Set(allDependents.flat())).filter(
        (dependent) => dependent !== ".temp_dependency_analyzer_entrypoint.ts",
      );
    };

    try {
      const initResult = await this.initializationPromise;
      if (!initResult.ok) return initResult;

      const allDependents = await collectAllNestedDependents(path);
      return { ok: true, value: allDependents };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
}
