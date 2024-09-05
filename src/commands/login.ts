import { Command } from "commander";
import { getAccessToken } from "../utils/auth.js";
import { clearToken, saveToken, saveUserData } from "../utils/config.js";
import { getUser } from "../utils/api.js";
import { checkVersion } from "../utils/common.js";

const login = new Command("login");

login.description("Log in and get access token").action(async () => {
  try {
    await checkVersion();
    const token = await getAccessToken();

    const user = await getUser(token);

    saveUserData(user);
    saveToken(token);
    console.log("Logged in successfully.");
    process.exit(0);
  } catch (error) {
    clearToken();
    const status = (error as any)?.status ?? 404;
    console.log(
      "Login failed.",
      status === 404 ? "You don't have access." : (error as any).message
    );
    process.exit(1);
  }
});

export default login;
