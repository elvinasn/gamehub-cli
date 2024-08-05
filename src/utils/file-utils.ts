import fs from "fs-extra";
import path from "path";

export const getFilesRecursively = (directory: string): string[] => {
  let files: string[] = [];

  const items = fs.readdirSync(directory);
  for (const item of items) {
    const fullPath = path.join(directory, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files = files.concat(getFilesRecursively(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
};

export const validateDirectory = (
  directory: string,
  platform: string
): boolean => {
  const files = fs.readdirSync(directory);

  if (platform === "windows") {
    return files.some((file) => file.endsWith(".exe"));
  } else if (platform === "macos") {
    return files.some((file) => file.endsWith(".app"));
  }
  return false;
};
