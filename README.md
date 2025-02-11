# Deno Package Collection

Welcome to the Deno Package Collection!

This repository is a collection of Deno modules and utilities designed to enhance your Deno development experience.  We aim to provide high-quality, reusable packages that address common needs in Deno projects, promoting efficiency and best practices.

## Modules

Currently, this repository houses the following modules:

### [deno-dag-test](./deno-dag-test/Readme.md)

[![jsr:@staytuned/deno-dag-test](https://jsr.io/@staytuned/deno-dag-test/badge)](https://jsr.io/@staytuned/deno-dag-test)

**Deno Dag Test** is a module that optimizes your testing workflow in Deno projects. It analyzes dependencies within your codebase and intelligently executes only the relevant test cases based on staged file changes in Git. This significantly reduces testing time in large and complex projects.

**Key Features:**

* **Dependency Mapping:** Uses `deno info` to build a comprehensive dependency graph.
* **Selective Test Execution:** Runs only the tests impacted by code modifications.
* **Monorepo Friendly:** Works efficiently in projects with multiple packages.
* **Git Integration:** Detects staged files to trigger relevant tests.

**[Learn more about deno-dag-test in its dedicated README](./deno-dag-test/Readme.md).**

## Getting Started

To use any of these modules, you can import them directly from JSR (JavaScript Service Registry) using the provided import specifiers. For example, to use `deno-dag-test`:

```typescript
import { checkStagedDagTests } from "jsr:@staytuned/deno-dag-test";

// Use checkStagedDagTests as needed in your project
```

Refer to each module's individual `Readme.md` for detailed usage instructions, API documentation, and examples.

## Contributing

We welcome contributions to this Deno Package Collection! If you have ideas for new modules, improvements to existing ones, or bug fixes, please feel free to:

1. Fork the repository.
2. Create a new branch for your feature or fix.
3. Make your changes and ensure tests pass.
4. Submit a pull request with a clear description of your changes.

## License

This project is licensed under the [MIT License](./LICENSE).

---

Thank you for exploring the Deno Package Collection. We hope these modules are valuable to your Deno projects!
