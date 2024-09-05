import { program } from "commander";
import login from "./commands/login.js";
import init from "./commands/init.js";
import build from "./commands/build.js";
import logout from "./commands/logout.js";
import whoami from "./commands/whoami.js";
import deleteVersion from "./commands/delete-pending-version.js";
import info from "./commands/info.js";
import deleteOldVersion from "./commands/delete-old-version.js";

program.addCommand(login);
program.addCommand(logout);
program.addCommand(whoami);
program.addCommand(init);
program.addCommand(info);
program.addCommand(build);
program.addCommand(deleteVersion);
program.addCommand(deleteOldVersion);

program.parse(process.argv);
