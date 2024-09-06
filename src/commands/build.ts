import { Presets, SingleBar } from "cli-progress";
import { Command } from "commander";
import fs from "fs-extra";
import inquirer from "inquirer";
import path from "path";
import {
  acknowledgeUploadFinished,
  getGameVersionStatus,
  getSignedUrls,
} from "../utils/api.js";
import {
  loadLocalConfig,
  loadToken,
  LOCAL_CONFIG_FILE_NAME,
} from "../utils/config.js";
import { getFilesRecursively } from "../utils/file-utils.js";
import { calculateChecksums, uploadFile } from "../utils/upload.js";
import { GameVersionStatus } from "../types/game-version-status.js";
import pLimit from "p-limit";
import { GetSignedUrlsResponse } from "../types/get-signed-urls-response.js";
import { runWithLoader } from "../utils/loader.js";
import { checkVersion } from "../utils/common.js";

function formatBytes(bytes: number) {
  const kb = 1024;
  const mb = kb * 1024;
  const gb = mb * 1024;
  const tb = gb * 1024;

  if (bytes < kb) return `${bytes}B`;
  if (bytes < mb) return `${(bytes / kb).toFixed(1)}KB`;
  if (bytes < gb) return `${(bytes / mb).toFixed(1)}MB`;
  if (bytes < tb) return `${(bytes / gb).toFixed(1)}GB`;
  return `${(bytes / tb).toFixed(1)}TB`;
}

function formatSpeed(speed: number) {
  if (speed < 1024) return `${speed.toFixed(1)}B/s`;
  if (speed < 1024 * 1024) return `${(speed / 1024).toFixed(1)}KB/s`;
  if (speed < 1024 * 1024 * 1024)
    return `${(speed / (1024 * 1024)).toFixed(1)}MB/s`;
  return `${(speed / (1024 * 1024 * 1024)).toFixed(1)}GB/s`;
}

const build = new Command("build");

build.description("Build and upload game assets").action(async () => {
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

  console.info(
    `Preparing to build ${config.game.title} for ${config.platform} from organisation ${config.organisation.name}`
  );
  const { version } = await inquirer
    .prompt({
      type: "input",
      name: "version",
      message: "Enter the version number",
      validate: validateVersion,
    } as any)
    .catch(() => {
      process.exit(1);
    });
  let status: GameVersionStatus;
  try {
    status = await getGameVersionStatus(
      token,
      config.game.id,
      config.platform,
      version
    );
  } catch (e: any) {
    console.log(e.message);
    if (
      typeof e.message === "string" &&
      e.message.includes("There are existing pending versions")
    ) {
      console.log(
        "Either use a pending version or delete the pending version using the delete-pending-version command."
      );
    }
    return;
  }

  if (status === GameVersionStatus.PENDING) {
    const { overwrite } = await inquirer
      .prompt({
        type: "confirm",
        name: "overwrite",
        message:
          "There is already pending build with this version. Do you want to overwrite it?",
      } as any)
      .catch(() => {
        process.exit(1);
      });
    if (!overwrite) {
      return;
    }
  }
  const files = getFilesRecursively(directory).map((filePath) =>
    path.relative(directory, filePath)
  );
  const localConfigIndex = files.indexOf(LOCAL_CONFIG_FILE_NAME);
  if (localConfigIndex !== -1) {
    files.splice(localConfigIndex, 1);
  }
  const checksums = await runWithLoader(calculateChecksums(directory, files), {
    errorText: "Failed to calculate checksums.",
    loadingText: "Calculating checksums...",
  });
  if (!checksums) {
    return;
  }
  let data: GetSignedUrlsResponse | null;
  try {
    data = await runWithLoader(
      getSignedUrls(token, config.game.id, config.platform, version, checksums),
      {
        errorText: "Failed to get signed URLs.",
        loadingText: "Getting ready to upload...",
      }
    );
  } catch (error: any) {
    console.error("Failed to get signed URLs:", error.message);
    return;
  }
  if (!data) {
    return;
  }

  let totalSize = 0;
  let fileSizes: { [key: string]: number } = {};
  for (const file of files) {
    const filePath = path.join(directory, file);
    const size = fs.statSync(filePath).size;
    totalSize += size;
    fileSizes[file] = size;
  }

  let startTime = Date.now();
  let speed = 0;
  const progressBar = new SingleBar(
    {
      format:
        "{bar}" +
        "| {percentage}% | ETA: {timeLeft} | {current}/{size} | Speed: {speed}",
    },
    Presets.shades_classic
  );
  progressBar.start(totalSize, 0);
  let uploadedSizes: { [key: string]: number } = {};

  const limit = pLimit(5);

  const proccessFile = async (file: string) => {
    const filePath = path.join(directory, file);
    const signedUrl = data.signedUrls[file];
    const fileSize = fileSizes[file];
    if (signedUrl) {
      await uploadFile(filePath, signedUrl, fileSize, (progress) => {
        const currentFileUploaded = fileSize * progress;
        uploadedSizes[file] = currentFileUploaded;
        const totalUploaded = Object.values(uploadedSizes).reduce(
          (a, b) => a + b,
          0
        );
        const { speed: currentSpeed, timeLeft } = calculateSpeedAndTimeLeft(
          totalUploaded,
          totalSize,
          startTime
        );
        if (currentSpeed !== speed) {
          speed = currentSpeed;
        }
        progressBar.update(totalUploaded, {
          speed: formatSpeed(speed),
          timeLeft: timeLeft.toFixed(0) + "s",
          current: formatBytes(totalUploaded),
          size: formatBytes(totalSize),
        });
      });
    } else {
      console.log(`No signed URL for ${file}`);
    }
  };
  const promises = files.map((file) => limit(() => proccessFile(file)));
  await Promise.all(promises);

  progressBar.stop();
  console.log("");
  try {
    await acknowledgeUploadFinished(
      config.game.id,
      token,
      version,
      config.platform
    );
  } catch (error: any) {
    console.error("Failed to upload:", error.message);
    return;
  }

  console.log("Build and upload completed.");
});

function calculateSpeedAndTimeLeft(
  totalUploaded: number,
  totalSize: number,
  startTime: number
) {
  const elapsedTime = (Date.now() - startTime) / 1000;
  const speed = totalUploaded / elapsedTime;
  const remaining = totalSize - totalUploaded;
  const timeLeft = remaining / speed;

  return { speed: speed, timeLeft };
}

const validateVersion = (input: string) => {
  const versionRegex = /^\d+\.\d+\.\d+$/;
  if (versionRegex.test(input)) {
    return true;
  } else {
    return "Invalid version format. Expected format is x.x.x where x is a number.";
  }
};

export default build;
