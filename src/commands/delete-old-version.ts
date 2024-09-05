import { Command } from "commander";
import inquirer from "inquirer";
import {
  getOldVersions,
  deleteOldVersion as deleteOldVersionApi,
} from "../utils/api.js";
import { loadLocalConfig, loadToken, loadUserData } from "../utils/config.js";
import { runWithLoader } from "../utils/loader.js";
import { checkVersion } from "../utils/common.js";

const deleteOldVersion = new Command("delete-old-version");

deleteOldVersion.description("Delete old game version").action(async () => {
  await checkVersion();
  const token = loadToken();
  const userData = loadUserData();
  if (!token || !userData) {
    console.log("Please log in first using the login command.");
    return;
  }
  const directory = process.cwd();
  const config = loadLocalConfig(directory);

  if (!config.organisation || !config.game || !config.platform) {
    console.log("Configuration missing. Please run the init command.");
    return;
  }

  const oldVersions = await runWithLoader(
    getOldVersions(token, config.game.id, config.platform),
    {
      loadingText: "Loading versions...",
      errorText: "Failed to load versions.",
    }
  );

  if (!oldVersions?.versions || !oldVersions.versions.length) {
    console.log("There are no old versions to delete.");
    return;
  }
  const versions = oldVersions.versions;
  const versionQuestion = {
    type: "list",
    name: "version",
    message: "Select a version to delete",
    choices: versions.map((v) => ({
      name: v,
      value: v,
    })),
  };

  const { version } = await inquirer
    .prompt(versionQuestion as any)
    .catch(() => {
      process.exit(1);
    });

  try {
    await deleteOldVersionApi(token, config.game.id, config.platform, version);
    console.log(`Version ${version} deleted successfully.`);
  } catch (error: any) {
    console.error("Failed to delete version:", error.message);
  }
});

export default deleteOldVersion;
