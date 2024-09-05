import { Command } from "commander";
import inquirer from "inquirer";
import { deletePendingVersion, getPendingVersions } from "../utils/api.js";
import { loadLocalConfig, loadToken, loadUserData } from "../utils/config.js";
import { runWithLoader } from "../utils/loader.js";
import { checkVersion } from "../utils/common.js";

const deleteVersion = new Command("delete-pending-version");

deleteVersion.description("Delete a pending game version").action(async () => {
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

  const pendingVersions = await runWithLoader(
    getPendingVersions(token, config.game.id, config.platform),
    {
      loadingText: "Loading versions...",
      errorText: "Failed to load versions.",
    }
  );

  if (!pendingVersions?.versions || !pendingVersions.versions.length) {
    console.log("There are no pending versions to delete.");
    return;
  }
  const versions = pendingVersions.versions;
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
    await deletePendingVersion(token, config.game.id, config.platform, version);
    console.log(`Version ${version} deleted successfully.`);
  } catch (error: any) {
    console.error("Failed to delete version:", error.message);
  }
});

export default deleteVersion;
