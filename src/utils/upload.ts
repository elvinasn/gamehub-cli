import axios from "axios";
import crypto from "crypto";
import fs from "fs-extra";

export const calculateChecksums = async (
  directory: string,
  files: string[]
) => {
  const checksums: { [key: string]: string } = {};
  await Promise.all(
    files.map(async (file) => {
      const filePath = `${directory}/${file}`;
      const fileBuffer = await fs.readFile(filePath);
      const checksum = crypto
        .createHash("sha256")
        .update(fileBuffer)
        .digest("hex");
      checksums[file] = checksum;
    })
  );
  return checksums;
};

export const uploadFile = async (
  filePath: string,
  signedUrl: string,
  fileSize: number,

  onProgress: (progress: number) => void
) => {
  const fileStream = fs.createReadStream(filePath);
  try {
    await axios.put(signedUrl, fileStream, {
      headers: { "Content-Type": "application/octet-stream" },
      onUploadProgress: (progressEvent) => {
        const progress = progressEvent.loaded / fileSize;
        onProgress(progress);
      },
    });
  } catch (e) {
    console.log(e);
    console.log("Failed to upload file: ", signedUrl);
    return;
  }
};
