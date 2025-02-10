// create_mock_projects.ts

//#region Imports
import { createProject1 } from "./createProject1.ts";
import { createProject2 } from "./createProject2.ts";
//#endregion

//#region Main Function
export const main = async (): Promise<void> => {
  await createProject1();
  await createProject2();
};

//#endregion
