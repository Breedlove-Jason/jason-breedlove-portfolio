import { spawn } from "node:child_process";

const host =
  process.env.VITE_HOST ||
  (process.env.CODESPACES === "true" ? "0.0.0.0" : "127.0.0.1");
const serverEnv = {
  ...process.env,
  HOST: process.env.HOST || host,
};
const children = [
  spawn(
    process.execPath,
    [
      "--env-file-if-exists=.env",
      "--import",
      "tsx",
      "--watch",
      "server/index.ts",
    ],
    { stdio: "inherit", env: serverEnv },
  ),
  spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", host], {
    stdio: "inherit",
  }),
];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill("SIGTERM");
  process.exitCode = code;
}
for (const child of children) {
  child.on("error", () => stop(1));
  child.on("exit", (code) => stop(code || 0));
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
