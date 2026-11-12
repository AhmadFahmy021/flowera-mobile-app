import Constants from 'expo-constants';

const DEFAULT_API_PORT = 3002;
const API_SUFFIX = '/api';

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

/**
 * Base URL for the Flowera REST API.
 *
 * Set `EXPO_PUBLIC_API_URL` (e.g. `http://192.168.1.10:3001/api`) for release
 * builds or a remote backend. In development the API host is derived from the
 * Metro dev-server host so a physical device can reach the API on the LAN.
 */
function resolveApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  if (configured) return stripTrailingSlash(configured);

  const devHost = Constants.expoConfig?.hostUri?.split(':')[0]?.trim();

  return `http://${devHost || 'localhost'}:${DEFAULT_API_PORT}${API_SUFFIX}`;
}

export const ApiBaseUrl = resolveApiBaseUrl();

/** Origin that serves uploaded assets (product images, store logos). */
export const FileBaseUrl = stripTrailingSlash(
  process.env.EXPO_PUBLIC_FILE_URL ?? ApiBaseUrl.replace(/\/api$/, '')
);

/** Turns a relative upload path from the API into an absolute image URL. */
export function resolveAssetUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;

  return path.startsWith('/') ? `${FileBaseUrl}${path}` : `${FileBaseUrl}/${path}`;
}
