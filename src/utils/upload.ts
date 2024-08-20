import axios from "axios";
import crypto from "crypto";
import fs from "fs-extra";
import got from "got";

export const calculateChecksums = async (
  directory: string,
  files: string[]
) => {
  const checksums: { [key: string]: string } = {};

  await Promise.all(
    files.map(async (file) => {
      const filePath = `${directory}/${file}`;
      const fileStream = fs.createReadStream(filePath);
      const hash = crypto.createHash("sha256");
      fileStream.pipe(hash);
      const checksum = await new Promise<string>((resolve, reject) => {
        hash.on("finish", () => {
          resolve(hash.digest("hex"));
        });
        hash.on("error", (err) => {
          reject(err);
        });
      });
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
): Promise<void> => {
  const fileStream = fs.createReadStream(filePath);
  let uploadedBytes = 0;

  try {
    await got.put(signedUrl, {
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: fileStream,
      hooks: {
        beforeRequest: [
          () => {
            fileStream.on("data", (chunk: Buffer) => {
              uploadedBytes += chunk.length;
              const progress = uploadedBytes / fileSize;
              onProgress(progress);
            });
          },
        ],
      },
    });

    fileStream.on("end", () => {
      onProgress(1);
    });
  } catch (e) {
    console.error("Failed to upload file:", e);
    console.error("Signed URL:", signedUrl);
  }
};
