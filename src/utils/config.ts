import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { User } from "../types/user";
import { Platform } from "../types/platform";
import { Game } from "../types/game";
import { Organisation } from "../types/organisation";

export type LocalConfig = {
  game?: Game;
  organisation?: Organisation;
  platform?: Platform;
};

export type GlobalConfig = {
  accessToken?: string;
  userData?: User;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GLOBAL_CONFIG_FILE_PATH = path.join(
  __dirname,
  "../../global-config.json"
);
export const LOCAL_CONFIG_FILE_NAME = "game-cli-config.json";

export const saveGlobalConfig = (config: GlobalConfig) => {
  fs.writeJsonSync(GLOBAL_CONFIG_FILE_PATH, config);
};

export const loadGlobalConfig = (): GlobalConfig => {
  if (fs.existsSync(GLOBAL_CONFIG_FILE_PATH)) {
    return fs.readJsonSync(GLOBAL_CONFIG_FILE_PATH);
  }
  return {};
};

export const saveToken = (token: string) => {
  const config = loadGlobalConfig();
  config.accessToken = token;
  saveGlobalConfig(config);
};

export const loadToken = (): string | null => {
  const config = loadGlobalConfig();
  return config.accessToken || null;
};

export const clearToken = () => {
  const config = loadGlobalConfig();
  delete config.accessToken;
  saveGlobalConfig(config);
};

export const saveUserData = (userData: User) => {
  const config = loadGlobalConfig();
  config.userData = userData;
  saveGlobalConfig(config);
};

export const loadUserData = (): User | null => {
  const config = loadGlobalConfig();
  return config.userData || null;
};

export const clearUserData = () => {
  const config = loadGlobalConfig();
  delete config.userData;
  saveGlobalConfig(config);
};

export const saveLocalConfig = (directory: string, config: LocalConfig) => {
  const localConfigPath = path.join(directory, LOCAL_CONFIG_FILE_NAME);
  fs.writeJsonSync(localConfigPath, config);
};

export const loadLocalConfig = (directory: string): LocalConfig => {
  const localConfigPath = path.join(directory, LOCAL_CONFIG_FILE_NAME);
  if (fs.existsSync(localConfigPath)) {
    return fs.readJsonSync(localConfigPath);
  }
  return {};
};
