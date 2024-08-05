const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "..", "dist", "index.js");

const data = fs.readFileSync(filePath);
const fd = fs.openSync(filePath, "w+");
const buffer = Buffer.from("#!/usr/bin/env node\n");
fs.writeSync(fd, buffer, 0, buffer.length, 0);
fs.writeSync(fd, data, 0, data.length, buffer.length);
fs.close(fd, (err) => {
  if (err) throw err;
});
