import fs from "fs";
import latestVersion from "latest-version";

export async function checkVersion() {
  try {
    const currentVersion = JSON.parse(
      fs.readFileSync("./package.json", "utf8")
    ).version;
    const packageName = JSON.parse(
      fs.readFileSync("./package.json", "utf8")
    ).name;
    let latest;
    latest = await latestVersion(packageName);

    if (latest && latest !== currentVersion) {
      console.log(
        `\x1b[33mWarning:\x1b[0m A new version (${latest}) of ${packageName} is available! You are using version ${currentVersion}. Please update by running 'npm install -g ${packageName}' or 'yarn global add ${packageName}'.`
      );
    }
  } catch (error) {
    return;
  }
}
