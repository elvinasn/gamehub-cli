import { Command } from "commander";
import inquirer from "inquirer";
import { Platform } from "../types/platform.js";
import { getGames, getOrganisations } from "../utils/api.js";
import { loadToken, loadUserData, saveLocalConfig } from "../utils/config.js";
import { validateDirectory } from "../utils/file-utils.js";
import { runWithLoader } from "../utils/loader.js";
import { checkVersion } from "../utils/common.js";

const init = new Command("init");

init
  .description("Initialize configuration with organization and game")
  .action(async () => {
    await checkVersion();
    const token = loadToken();
    const userData = loadUserData();
    if (!token || !userData) {
      console.log("Please log in first using the login command.");
      return;
    }

    const organisations = await runWithLoader(getOrganisations(token), {
      loadingText: "Loading your organisations...",
      errorText: "Failed to load organisations.",
    });

    if (!organisations || !organisations.length) {
      console.log("You have not access to any gamelauncher organisations.");
      return;
    }
    const organisationQuestion = {
      type: "list",
      name: "organisation",
      message: "Select an organisation",
      choices: organisations.map((org) => ({
        name: org.name,
        value: org.id,
      })),
    };

    const { organisation } = await inquirer
      .prompt(organisationQuestion as any)
      .catch(() => {
        process.exit(1);
      });

    const games = await runWithLoader(getGames(token, organisation), {
      loadingText: "Loading games...",
      errorText: "Failed to load games.",
    });

    if (!games || !games.length) {
      console.log("No games found in this organisation.");
      return;
    }

    const { game } = await inquirer
      .prompt({
        type: "list",
        name: "game",
        message: "Select a game",
        choices: games.map((game) => ({ name: game.title, value: game.id })),
      } as any)
      .catch(() => {
        process.exit(1);
      });

    const { platform } = await inquirer
      .prompt({
        type: "list",
        name: "platform",
        message: "Select a platform",
        choices: [Platform.windows, Platform.macos],
      } as any)
      .catch(() => {
        process.exit(1);
      });

    const dir = process.cwd();

    if (!validateDirectory(dir, platform)) {
      console.log(
        `Invalid directory. For ${platform}, the directory must contain an ${
          platform === "windows" ? ".exe" : ".app"
        } file.`
      );
      return;
    }

    const selectedOrganisation = organisations.find(
      (org) => org.id === organisation
    );
    const selectedGame = games.find((g) => g.id === game);

    const config = {
      organisation: selectedOrganisation,
      game: selectedGame,
      platform,
    };

    const directory = process.cwd();
    saveLocalConfig(directory, config);
    console.log(
      "Configuration initialized. You can upload game assets using the build command."
    );
  });

export default init;
