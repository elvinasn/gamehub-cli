import { Command } from "commander";
import { clearToken, clearUserData } from "../utils/config.js";

const logout = new Command("logout");

logout.description("Log out and clear the access token").action(() => {
  clearToken();
  clearUserData();
  console.log("Logged out successfully.");
});

export default logout;
