import { ensureDir } from "@std/fs";
import { join } from "@std/path";

const getRandomData = (): string => Math.random().toString(36).substring(2, 15);

const createDir = async (path: string): Promise<void> => {
  await ensureDir(path);
};

const createFile = async (path: string, content: string): Promise<void> => {
  await Deno.writeTextFile(path, content);
};

export const createProject1 = async (): Promise<void> => {
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

  await Promise.all(
    directories.map((dir) => createDir(join(project1Root, dir))),
  );

  const fileImports: Record<string, string[]> = {
    // Components - Header
    "components/header/index.ts": [
      "./helpers/layoutHelper.ts",
      "./helpers/styleHelper.ts",
      "../../utils/helpers/stringUtils.ts",
    ],
    "components/header/helpers/layoutHelper.ts": [
      "../../styles.ts",
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

  await Promise.all(
    files.map(async (file) => {
      const filePath = join(project1Root, file);
      const imports = fileImports[file] || [];
      let content = imports
        .map((importPath) => `import '${importPath}';`)
        .join("\n");

      content +=
        `\n\nexport const b${getRandomData()} = '${getRandomData()}';\n`;

      await createFile(filePath, content);
    }),
  );

  console.log("Project 1 created successfully!\n");
};
