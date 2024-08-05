import { Command } from "commander";
import { clearToken, loadToken, loadUserData } from "../utils/config.js";

const whoami = new Command("whoami");

whoami
  .description("Display current logged-in user information")
  .action(async () => {
    const token = loadToken();
    if (!token) {
      console.log(
        "You are not logged in. Please log in first using the login command."
      );
      return;
    }

    try {
      const userData = loadUserData();
      if (userData) {
        console.log(`User: ${userData.email}`);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      clearToken();
    }
  });

export default whoami;
