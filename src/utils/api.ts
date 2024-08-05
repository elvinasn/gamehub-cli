import axios, { isAxiosError } from "axios";
import { Platform } from "../types/platform.js";
import { GetSignedUrlsResponse } from "../types/get-signed-urls-response.js";
import { Organisation } from "../types/organisation.js";
import { Game } from "../types/game.js";
import { GameType } from "../types/game-type.js";
import { User } from "../types/user.js";
import { GameVersionStatus } from "../types/game-version-status.js";
import { GetVersionStatusResponse } from "../types/get-version-status-response.js";
import { GetPendingVersionsResponse } from "../types/get-pending-versions-response.js";

const API_URL = "https://gs-launcher-backend-hbfkrtocca-ew.a.run.app";

const K_ADMIN_PATH = "/admin";
const K_GAME_ASSETS_PATH = "/game-assets";
const K_VERSION_STATUS_PATH = "/version-status";
const K_SIGNED_URLS_PATH = "/signed-urls";
const K_ORGANISATIONS_PATH = "/organisations";
const K_GAMES_PATH = "/game-info";
const K_USERS_PATH = "/users";
const K_ACK_PATH = "/acknowledge-upload";
const K_AUTH_PATH = "/auth";
const K_LOGIN_PATH = "/login";
const K_PENDING_VERSIONS_PATH = "/pending-versions";

export enum METHOD {
  POST = "POST",
  GET = "GET",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export type CustomException = {
  status: number;
  message: string;
};

export async function login(
  code: string,
  redirect_uri: string
): Promise<string> {
  const response = await makeRequest<{ access_token: string }>(
    `${API_URL}${K_ADMIN_PATH}${K_AUTH_PATH}${K_LOGIN_PATH}`,
    METHOD.POST,
    undefined,
    { code, redirect_uri }
  );
  return response.access_token;
}

export async function getPendingVersions(
  accessToken: string,
  gameId: string,
  platform: Platform
) {
  const data = await makeRequest<GetPendingVersionsResponse>(
    `${API_URL}${K_ADMIN_PATH}${K_GAME_ASSETS_PATH}/${gameId}${K_PENDING_VERSIONS_PATH}`,
    METHOD.GET,
    accessToken,
    undefined,
    { platform }
  );
  return data;
}

export async function deletePendingVersion(
  accessToken: string,
  gameId: string,
  platform: Platform,
  version: string
) {
  await makeRequest<void>(
    `${API_URL}${K_ADMIN_PATH}${K_GAME_ASSETS_PATH}/${gameId}${K_PENDING_VERSIONS_PATH}`,
    METHOD.DELETE,
    accessToken,
    { platform, version }
  );
}

export async function getSignedUrls(
  accessToken: string,
  gameId: string,
  platform: Platform,
  version: string,
  checksum: { [key: string]: string }
): Promise<GetSignedUrlsResponse> {
  const data = await makeRequest<GetSignedUrlsResponse>(
    `${API_URL}${K_ADMIN_PATH}${K_GAME_ASSETS_PATH}/${gameId}${K_SIGNED_URLS_PATH}`,
    METHOD.POST,
    accessToken,
    { platform, version, checksum }
  );
  return data;
}

export async function getGameVersionStatus(
  accessToken: string,
  gameId: string,
  platform: Platform,
  version: string
): Promise<GameVersionStatus> {
  const data = await makeRequest<GetVersionStatusResponse>(
    `${API_URL}${K_ADMIN_PATH}${K_GAME_ASSETS_PATH}/${gameId}${K_VERSION_STATUS_PATH}`,
    METHOD.GET,
    accessToken,
    null,
    {
      platform,
      version,
    }
  );
  return data.status;
}

export async function getOrganisations(
  accessToken: string
): Promise<Organisation[]> {
  const data = await makeRequest<Organisation[]>(
    `${API_URL}${K_ADMIN_PATH}${K_ORGANISATIONS_PATH}`,
    METHOD.GET,
    accessToken
  );

  return data;
}

export async function getGames(
  accessToken: string,
  organisationId: string
): Promise<Game[]> {
  const response = await makeRequest<Game[]>(
    `${API_URL}${K_ADMIN_PATH}${K_GAMES_PATH}`,
    METHOD.GET,
    accessToken,
    undefined,
    { organisationId }
  );
  return response.filter((e) => e.gameType === GameType.regular);
}

export async function getUser(accessToken: string): Promise<User> {
  const response = await makeRequest<User>(
    `${API_URL}${K_ADMIN_PATH}${K_USERS_PATH}`,
    METHOD.GET,
    accessToken
  );
  return response;
}

export async function acknowledgeUploadFinished(
  gameId: string,
  accessToken: string,
  version: string,
  platform: Platform
): Promise<void> {
  await makeRequest<void>(
    `${API_URL}${K_ADMIN_PATH}${K_GAME_ASSETS_PATH}/${gameId}${K_ACK_PATH}`,
    METHOD.POST,
    accessToken,
    { version, platform }
  );
}

async function makeRequest<T>(
  url: string,
  method: METHOD,
  accessToken?: string,
  data?: any,
  queryParams?: any
) {
  const headers: HeadersInit = {};
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  try {
    const response = await axios({
      method,
      url,
      data: data,
      headers,
      params: queryParams,
    });
    if (response.status > 300) {
      if (response.status === 400) {
        throw {
          status: 400,
          message: response.data.message,
        };
      }
      throw exceptionFactory(response.status);
    }
    const responseData: T = await response.data;
    return responseData;
  } catch (e: any) {
    if (e.response.status === 400) {
      throw {
        status: 400,
        message: e.response.data.message,
      };
    }
    if (isAxiosError(e)) {
      throw exceptionFactory(e.response?.status || 500);
    }
    throw statusExceptionMap[500];
  }
}

const statusExceptionMap: {
  [status: number]: { status: number; message: string };
} = {
  301: { status: 301, message: "Moved Permanently" },
  302: { status: 302, message: "Found" },
  303: { status: 303, message: "See Other" },
  304: { status: 304, message: "Not Modified" },
  307: { status: 307, message: "Temporary Redirect" },
  401: { status: 401, message: "Unauthorized" },
  403: { status: 403, message: "Forbidden" },
  404: { status: 404, message: "Not Found" },
  405: { status: 405, message: "Method Not Allowed" },
  409: { status: 409, message: "Conflict" },
  410: { status: 410, message: "Gone" },
  412: {
    status: 412,
    message: "Precondition Failed",
  },
  415: {
    status: 415,
    message: "Unsupported Media Type",
  },
  422: {
    status: 422,
    message: "Unprocessable Entity",
  },
  429: { status: 429, message: "Too Many Requests" },
  500: { status: 500, message: "Internal Server Error" },
  501: { status: 501, message: "Not Implemented" },
  502: { status: 502, message: "Bad Gateway" },
  503: {
    status: 503,
    message: "Service Unavailable",
  },
  504: { status: 504, message: "Gateway Timeout" },
};

export function exceptionFactory(status: number) {
  if (!statusExceptionMap[status]) {
    return {
      status: status,
      message: "Internal Server Error",
    };
  }
  return statusExceptionMap[status];
}
