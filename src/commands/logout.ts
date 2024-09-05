import { Command } from "commander";
import { clearToken, clearUserData } from "../utils/config.js";
import { checkVersion } from "../utils/common.js";

const logout = new Command("logout");

logout.description("Log out and clear the access token").action(async () => {
  await checkVersion();
  clearToken();
  clearUserData();
  console.log("Logged out successfully.");
});

export default logout;
