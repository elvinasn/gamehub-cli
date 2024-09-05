import { Command } from "commander";
import { loadLocalConfig, loadToken } from "../utils/config.js";
import { checkVersion } from "../utils/common.js";

const info = new Command("info");

info
  .description("Information about current folder configuration")
  .action(async () => {
    await checkVersion();
    const token = loadToken();
    if (!token) {
      console.log(
        "You are not logged in. Please log in first using the login command."
      );
      return;
    }
    const directory = process.cwd();
    const config = loadLocalConfig(directory);

    if (!config.organisation || !config.game || !config.platform) {
      console.log("Configuration missing. Please run the init command.");
      return;
    }
    console.log("Current folder configuration:");
    console.log("Organisation:", config.organisation.name);
    console.log("Game:", config.game.title);
    console.log("Platform:", config.platform);
  });

export default info;
