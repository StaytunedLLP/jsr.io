// create_mock_projects.ts

//#region Imports
import { ensureDir } from "@std/fs";
import { join } from "@std/path";
//#endregion

//#region Helper Functions
const getRandomData = (): string => Math.random().toString(36).substring(2, 15);

const createDir = async (path: string): Promise<void> => {
  await ensureDir(path);
};

const createFile = async (path: string, content: string): Promise<void> => {
  await Deno.writeTextFile(path, content);
};
//#endregion

//#region Project 1
const createProject1 = async (): Promise<void> => {
  console.log("Creating Project 1...");

  const project1Root = "project1/src";

  const directories = [
    "components/header/helpers",
    "components/header/tests",
    "components/footer/helpers",
    "components/footer/tests",
    "components/sidebar/helpers",
    "components/sidebar/tests",
    "services/api/models",
    "services/api/tests",
    "services/auth/tests",
    "utils/helpers",
    "utils/tests",
    "utils/constants",
  ];

  const files = [
    // Components - Header
    "components/header/index.ts",
    "components/header/styles.ts",
    "components/header/helpers/layoutHelper.ts",
    "components/header/helpers/styleHelper.ts",
    "components/header/tests/header_test.ts",
    "components/header/tests/layoutHelper_test.ts",

    // Components - Footer
    "components/footer/index.ts",
    "components/footer/styles.ts",
    "components/footer/helpers/linkHelper.ts",
    "components/footer/tests/footer_test.ts",
    "components/footer/tests/linkHelper_test.ts",

    // Components - Sidebar
    "components/sidebar/index.ts",
    "components/sidebar/styles.ts",
    "components/sidebar/helpers/menuHelper.ts",
    "components/sidebar/tests/sidebar_test.ts",
    "components/sidebar/tests/menuHelper_test.ts",

    // Services - API
    "services/api/client.ts",
    "services/api/endpoints.ts",
    "services/api/models/userModel.ts",
    "services/api/models/productModel.ts",
    "services/api/tests/client_test.ts",
    "services/api/tests/userModel_test.ts",

    // Services - Auth
    "services/auth/login.ts",
    "services/auth/logout.ts",
    "services/auth/tests/auth_test.ts",
    "services/auth/tests/login_test.ts",

    // Utilities
    "utils/helpers/stringUtils.ts",
    "utils/helpers/numberUtils.ts",
    "utils/helpers/dateUtils.ts",
    "utils/constants/appConstants.ts",
    "utils/constants/errorCodes.ts",
    "utils/tests/stringUtils_test.ts",
    "utils/tests/numberUtils_test.ts",
  ];

  // Create directories
  await Promise.all(
    directories.map((dir) => createDir(join(project1Root, dir))),
  );

  // Mapping of file imports for dependencies
  const fileImports: Record<string, string[]> = {
    // Components - Header
    "components/header/index.ts": [
      "./helpers/layoutHelper.ts",
      "./helpers/styleHelper.ts",
      "../../utils/helpers/stringUtils.ts",
    ],
    "components/header/helpers/layoutHelper.ts": [
      "../styles.ts",
      "../../../utils/helpers/stringUtils.ts",
    ],
    "components/header/helpers/styleHelper.ts": [
      "../../../utils/constants/appConstants.ts",
    ],
    "components/header/styles.ts": [],
    "components/header/tests/header_test.ts": ["../index.ts"],
    "components/header/tests/layoutHelper_test.ts": [
      "../helpers/layoutHelper.ts",
    ],

    // Components - Footer
    "components/footer/index.ts": [
      "./helpers/linkHelper.ts",
      "../../utils/helpers/dateUtils.ts",
    ],
    "components/footer/helpers/linkHelper.ts": [
      "../../../utils/constants/errorCodes.ts",
    ],
    "components/footer/styles.ts": [],
    "components/footer/tests/footer_test.ts": ["../index.ts"],
    "components/footer/tests/linkHelper_test.ts": [
      "../helpers/linkHelper.ts",
    ],

    // Components - Sidebar
    "components/sidebar/index.ts": [
      "./helpers/menuHelper.ts",
      "../../services/auth/login.ts",
    ],
    "components/sidebar/helpers/menuHelper.ts": [
      "../../../utils/helpers/numberUtils.ts",
    ],
    "components/sidebar/styles.ts": [],
    "components/sidebar/tests/sidebar_test.ts": ["../index.ts"],
    "components/sidebar/tests/menuHelper_test.ts": [
      "../helpers/menuHelper.ts",
    ],

    // Services - API
    "services/api/client.ts": [
      "./models/userModel.ts",
      "../../utils/constants/appConstants.ts",
    ],
    "services/api/endpoints.ts": ["./client.ts"],
    "services/api/models/userModel.ts": ["./productModel.ts"],
    "services/api/models/productModel.ts": [],
    "services/api/tests/client_test.ts": ["../client.ts"],
    "services/api/tests/userModel_test.ts": ["../models/userModel.ts"],

    // Services - Auth
    "services/auth/login.ts": ["../../utils/helpers/stringUtils.ts"],
    "services/auth/logout.ts": ["../../utils/helpers/dateUtils.ts"],
    "services/auth/tests/auth_test.ts": ["../login.ts", "../logout.ts"],
    "services/auth/tests/login_test.ts": ["../login.ts"],

    // Utilities
    "utils/helpers/stringUtils.ts": ["../constants/appConstants.ts"],
    "utils/helpers/numberUtils.ts": ["../constants/errorCodes.ts"],
    "utils/helpers/dateUtils.ts": [],
    "utils/constants/appConstants.ts": [],
    "utils/constants/errorCodes.ts": [],
    "utils/tests/stringUtils_test.ts": ["../helpers/stringUtils.ts"],
    "utils/tests/numberUtils_test.ts": ["../helpers/numberUtils.ts"],
  };

  // Create files with imports
  await Promise.all(
    files.map(async (file) => {
      const filePath = join(project1Root, file);
      const imports = fileImports[file] || [];
      let content = imports
        .map((importPath) => `import '${importPath}';`)
        .join("\n");

      // Add a simple export to each file to avoid empty modules
      content +=
        `\n\nexport const b${getRandomData()} = '${getRandomData()}';\n`;

      await createFile(filePath, content);
    }),
  );

  console.log("Project 1 created successfully!\n");
};
//#endregion

//#region Project 2
const createProject2 = async (): Promise<void> => {
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

  // Create directories
  await Promise.all(
    directories.map((dir) => createDir(join(project2Root, dir))),
  );

  // Mapping of file imports for dependencies
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
      "../../../../utils/src/validators/emailValidator.ts", // Cross-package dependency
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

  // Create files with imports
  await Promise.all(
    files.map(async (file) => {
      const filePath = join(project2Root, file);
      const imports = fileImports[file] || [];
      let content = imports
        .map((importPath) => `import '${importPath}';`)
        .join("\n");

      // Add a simple export to each file to avoid empty modules
      content +=
        `\n\nexport const a${getRandomData()} = '${getRandomData()}';\n`;

      await createFile(filePath, content);
    }),
  );

  console.log("Project 2 created successfully!\n");
};
//#endregion

//#region Main Function
export const main = async (): Promise<void> => {
  await createProject1();
  await createProject2();
};

//#endregion
