import { ensureDir } from "@std/fs";
import { join } from "@std/path";

const getRandomData = (): string => Math.random().toString(36).substring(2, 15);

const createDir = async (path: string): Promise<void> => {
  await ensureDir(path);
};

const createFile = async (path: string, content: string): Promise<void> => {
  await Deno.writeTextFile(path, content);
};

export const createProject2 = async (): Promise<void> => {
  console.log("Creating Project 2...");

  const project2Root = "project2/packages";

  const directories = [
    "core/src/config",
    "core/src/utils",
    "core/src/tests",
    "ui-components/src/button/helpers",
    "ui-components/src/button/tests",
    "ui-components/src/modal/helpers",
    "ui-components/src/modal/tests",
    "data-services/src/database/models",
    "data-services/src/database/queries",
    "data-services/src/database/tests",
    "data-services/src/cache",
    "data-services/src/cache/tests",
    "utils/src/logger/transports",
    "utils/src/logger/tests",
    "utils/src/validators",
    "utils/src/validators/tests",
  ];

  const files = [
    // Core Package
    "core/src/index.ts",
    "core/src/config/defaultConfig.ts",
    "core/src/config/envConfig.ts",
    "core/src/utils/coreUtils.ts",
    "core/src/tests/core_test.ts",
    "core/src/tests/coreUtils_test.ts",

    // UI Components Package - Button
    "ui-components/src/button/index.ts",
    "ui-components/src/button/styles.ts",
    "ui-components/src/button/helpers/clickHelper.ts",
    "ui-components/src/button/tests/button_test.ts",
    "ui-components/src/button/tests/clickHelper_test.ts",

    // UI Components Package - Modal
    "ui-components/src/modal/index.ts",
    "ui-components/src/modal/styles.ts",
    "ui-components/src/modal/helpers/animationHelper.ts",
    "ui-components/src/modal/tests/modal_test.ts",
    "ui-components/src/modal/tests/animationHelper_test.ts",

    // Data Services Package
    "data-services/src/database/connection.ts",
    "data-services/src/database/models/userModel.ts",
    "data-services/src/database/models/orderModel.ts",
    "data-services/src/database/queries/userQueries.ts",
    "data-services/src/database/queries/orderQueries.ts",
    "data-services/src/database/tests/connection_test.ts",
    "data-services/src/database/tests/userModel_test.ts",

    "data-services/src/cache/redisClient.ts",
    "data-services/src/cache/cacheUtils.ts",
    "data-services/src/cache/tests/redisClient_test.ts",
    "data-services/src/cache/tests/cacheUtils_test.ts",

    // Utils Package
    "utils/src/logger/index.ts",
    "utils/src/logger/transports/consoleTransport.ts",
    "utils/src/logger/transports/fileTransport.ts",
    "utils/src/logger/tests/logger_test.ts",
    "utils/src/logger/tests/transports_test.ts",

    "utils/src/validators/emailValidator.ts",
    "utils/src/validators/passwordValidator.ts",
    "utils/src/validators/dataValidator.ts",
    "utils/src/validators/tests/emailValidator_test.ts",
    "utils/src/validators/tests/dataValidator_test.ts",
  ];

  await Promise.all(
    directories.map((dir) => createDir(join(project2Root, dir))),
  );

  const fileImports: Record<string, string[]> = {
    // Core Package
    "core/src/index.ts": [
      "./utils/coreUtils.ts",
      "./config/defaultConfig.ts",
      "../../utils/src/logger/index.ts", // Cross-package dependency
    ],
    "core/src/config/defaultConfig.ts": [],
    "core/src/config/envConfig.ts": ["./defaultConfig.ts"],
    "core/src/utils/coreUtils.ts": ["../config/envConfig.ts"],
    "core/src/tests/core_test.ts": ["../index.ts"],
    "core/src/tests/coreUtils_test.ts": ["../utils/coreUtils.ts"],

    // UI Components Package - Button
    "ui-components/src/button/index.ts": [
      "./helpers/clickHelper.ts",
      "../../../core/src/index.ts", // Cross-package dependency
      "../../../utils/src/validators/dataValidator.ts", // Cross-package dependency
    ],
    "ui-components/src/button/styles.ts": [],
    "ui-components/src/button/helpers/clickHelper.ts": ["../styles.ts"],
    "ui-components/src/button/tests/button_test.ts": ["../index.ts"],
    "ui-components/src/button/tests/clickHelper_test.ts": [
      "../helpers/clickHelper.ts",
    ],

    // UI Components Package - Modal
    "ui-components/src/modal/index.ts": [
      "./helpers/animationHelper.ts",
      "../../../core/src/index.ts", // Cross-package dependency
    ],
    "ui-components/src/modal/styles.ts": [],
    "ui-components/src/modal/helpers/animationHelper.ts": ["../styles.ts"],
    "ui-components/src/modal/tests/modal_test.ts": ["../index.ts"],
    "ui-components/src/modal/tests/animationHelper_test.ts": [
      "../helpers/animationHelper.ts",
    ],

    // Data Services Package - Database
    "data-services/src/database/connection.ts": [
      "../../../core/src/index.ts", // Cross-package dependency
      "../../../utils/src/logger/index.ts", // Cross-package dependency
    ],
    "data-services/src/database/models/userModel.ts": [
      "../../../utils/src/validators/emailValidator.ts", // Cross-package dependency
    ],
    "data-services/src/database/models/orderModel.ts": [],
    "data-services/src/database/queries/userQueries.ts": [
      "../models/userModel.ts",
    ],
    "data-services/src/database/queries/orderQueries.ts": [
      "../models/orderModel.ts",
    ],
    "data-services/src/database/tests/connection_test.ts": [
      "../connection.ts",
    ],
    "data-services/src/database/tests/userModel_test.ts": [
      "../models/userModel.ts",
    ],

    // Data Services Package - Cache
    "data-services/src/cache/redisClient.ts": ["./cacheUtils.ts"],
    "data-services/src/cache/cacheUtils.ts": [],
    "data-services/src/cache/tests/redisClient_test.ts": [
      "../redisClient.ts",
    ],
    "data-services/src/cache/tests/cacheUtils_test.ts": [
      "../cacheUtils.ts",
    ],

    // Utils Package - Logger
    "utils/src/logger/index.ts": ["./transports/consoleTransport.ts"],
    "utils/src/logger/transports/consoleTransport.ts": [],
    "utils/src/logger/transports/fileTransport.ts": [],
    "utils/src/logger/tests/logger_test.ts": ["../index.ts"],
    "utils/src/logger/tests/transports_test.ts": [
      "../transports/consoleTransport.ts",
      "../transports/fileTransport.ts",
    ],

    // Utils Package - Validators
    "utils/src/validators/emailValidator.ts": [],
    "utils/src/validators/passwordValidator.ts": [],
    "utils/src/validators/dataValidator.ts": [
      "./emailValidator.ts",
      "./passwordValidator.ts",
    ],
    "utils/src/validators/tests/emailValidator_test.ts": [
      "../emailValidator.ts",
    ],
    "utils/src/validators/tests/dataValidator_test.ts": [
      "../dataValidator.ts",
    ],
  };

  await Promise.all(
    files.map(async (file) => {
      const filePath = join(project2Root, file);
      const imports = fileImports[file] || [];
      let content = imports
        .map((importPath) => `import '${importPath}';`)
        .join("\n");

      content +=
        `\n\nexport const a${getRandomData()} = '${getRandomData()}';\n`;

      await createFile(filePath, content);
    }),
  );

  console.log("Project 2 created successfully!\n");
};
