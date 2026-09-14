import type {
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyPlaylist,
  SpotifyPlaylistItem,
  SpotifyPlaylistItemsResponse,
  SpotifyProfile,
  SpotifySearchResponse,
  SpotifyToken,
  SpotifyTrack
} from '../types/spotify';
import {
  clearSpotifyToken,
  getSpotifyToken,
  saveSpotifyToken
} from './storage';

const API_BASE = 'https://api.spotify.com/v1';
const ACCOUNTS_BASE = 'https://accounts.spotify.com';

const CLIENT_ID =
  import.meta.env.VITE_SPOTIFY_CLIENT_ID as string | undefined;

const REDIRECT_URI =
  import.meta.env.VITE_SPOTIFY_REDIRECT_URI as string | undefined;

const DEFAULT_SCOPE = [
  'user-read-private',
  'user-read-email',
  'playlist-read-private',
  'playlist-read-collaborative'
].join(' ');

interface SpotifyApiErrorBody {
  error?: {
    status?: number;
    message?: string;
  };
}

export class SpotifyError extends Error {
  status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = 'SpotifyError';
    this.status = status;
  }
}

function getRedirectUri(): string {
  if (REDIRECT_URI) {
    return REDIRECT_URI;
  }

  return `${window.location.origin}${import.meta.env.BASE_URL}`;
}

function ensureClientId(): string {
  if (!CLIENT_ID) {
    throw new SpotifyError(
      'Spotify Client ID is not configured.'
    );
  }

  return CLIENT_ID;
}

function randomString(length: number): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

  const values = new Uint8Array(length);
  crypto.getRandomValues(values);

  return Array.from(values)
    .map((value) => chars[value % chars.length])
    .join('');
}

async function sha256(value: string): Promise<ArrayBuffer> {
  return crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value)
  );
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);

  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function loginWithSpotify(): Promise<void> {
  const clientId = ensureClientId();

  const verifier = randomString(96);
  const challenge = base64UrlEncode(
    await sha256(verifier)
  );

  const state = randomString(32);

  sessionStorage.setItem(
    'spotify-code-verifier',
    verifier
  );

  sessionStorage.setItem(
    'spotify-oauth-state',
    state
  );

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: DEFAULT_SCOPE,
    redirect_uri: getRedirectUri(),
    state,
    code_challenge_method: 'S256',
    code_challenge: challenge
  });

  window.location.assign(
    `${ACCOUNTS_BASE}/authorize?${params.toString()}`
  );
}

export async function handleSpotifyCallback(): Promise<boolean> {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const returnedState = params.get('state');
  const error = params.get('error');

  if (error) {
    throw new SpotifyError(
      `Spotify authorization failed: ${error}`
    );
  }

  if (!code) {
    return false;
  }

  const expectedState =
    sessionStorage.getItem('spotify-oauth-state');

  const verifier =
    sessionStorage.getItem('spotify-code-verifier');

  if (!expectedState || !returnedState || returnedState !== expectedState) {
    throw new SpotifyError(
      'Spotify authorization state validation failed.'
    );
  }

  if (!verifier) {
    throw new SpotifyError(
      'Spotify PKCE verifier is missing.'
    );
  }

  const clientId = ensureClientId();

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: getRedirectUri(),
    code_verifier: verifier
  });

  const response = await fetch(
    `${ACCOUNTS_BASE}/api/token`,
    {
      method: 'POST',
      headers: {
        'Content-Type':
          'application/x-www-form-urlencoded'
      },
      body
    }
  );

  if (!response.ok) {
    throw new SpotifyError(
      'Could not exchange Spotify authorization code.',
      response.status
    );
  }

  const data = (await response.json()) as {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
    scope: string;
  };

  const token: SpotifyToken = {
    ...data,
    expires_at:
      Date.now() + data.expires_in * 1000
  };

  saveSpotifyToken(token);

  sessionStorage.removeItem('spotify-code-verifier');
  sessionStorage.removeItem('spotify-oauth-state');

  window.history.replaceState(
    {},
    document.title,
    `${window.location.pathname}${window.location.hash}`
  );

  return true;
}

async function refreshToken(
  token: SpotifyToken
): Promise<SpotifyToken> {
  if (!token.refresh_token) {
    clearSpotifyToken();

    throw new SpotifyError(
      'Spotify session expired. Please connect again.',
      401
    );
  }

  const clientId = ensureClientId();

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'refresh_token',
    refresh_token: token.refresh_token
  });

  const response = await fetch(
    `${ACCOUNTS_BASE}/api/token`,
    {
      method: 'POST',
      headers: {
        'Content-Type':
          'application/x-www-form-urlencoded'
      },
      body
    }
  );

  if (!response.ok) {
    clearSpotifyToken();

    throw new SpotifyError(
      'Spotify session expired. Please connect again.',
      response.status
    );
  }

  const data = (await response.json()) as {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
    scope: string;
  };

  const next: SpotifyToken = {
    access_token: data.access_token,
    token_type: data.token_type,
    expires_in: data.expires_in,
    refresh_token:
      data.refresh_token ?? token.refresh_token,
    scope: data.scope || token.scope,
    expires_at:
      Date.now() + data.expires_in * 1000
  };

  saveSpotifyToken(next);

  return next;
}

async function getAccessToken(): Promise<string> {
  const token = getSpotifyToken();

  if (!token) {
    throw new SpotifyError(
      'Spotify connection required.',
      401
    );
  }

  if (Date.now() < token.expires_at - 60_000) {
    return token.access_token;
  }

  const refreshed = await refreshToken(token);

  return refreshed.access_token;
}

async function spotifyFetch<T>(
  endpoint: string,
  init?: RequestInit
): Promise<T> {
  const token = await getAccessToken();

  const headers = new Headers(init?.headers);

  headers.set(
    'Authorization',
    `Bearer ${token}`
  );

  if (init?.body && !headers.has('Content-Type')) {
    headers.set(
      'Content-Type',
      'application/json'
    );
  }

  const response = await fetch(
    endpoint.startsWith('http')
      ? endpoint
      : `${API_BASE}${endpoint}`,
    {
      ...init,
      headers
    }
  );

  if (response.status === 401) {
    clearSpotifyToken();

    throw new SpotifyError(
      'Spotify session expired. Please connect again.',
      401
    );
  }

  if (response.status === 429) {
    throw new SpotifyError(
      'Spotify rate limit reached. Please wait a moment.',
      429
    );
  }

  if (!response.ok) {
    let message = 'Spotify API request failed.';

    try {
      const body =
        (await response.json()) as SpotifyApiErrorBody;

      message =
        body.error?.message ??
        message;
    } catch {
      // Ignore invalid JSON.
    }

    throw new SpotifyError(
      message,
      response.status
    );
  }

  return response.json() as Promise<T>;
}

export function isSpotifyConfigured(): boolean {
  return Boolean(CLIENT_ID);
}

export function isSpotifyConnected(): boolean {
  return Boolean(getSpotifyToken());
}

export function logoutSpotify(): void {
  clearSpotifyToken();
}

export async function getCurrentUser(): Promise<SpotifyProfile> {
  return spotifyFetch<SpotifyProfile>('/me');
}

export interface SearchResult {
  tracks: SpotifyTrack[];
  artists: SpotifyArtist[];
  albums: SpotifyAlbum[];
  playlists: SpotifyPlaylist[];
}

export async function searchSpotify(
  query: string
): Promise<SearchResult> {
  const params = new URLSearchParams({
    q: query,
    type: 'track,artist,album,playlist',
    limit: '10',
    market: 'US'
  });

  const result =
    await spotifyFetch<SpotifySearchResponse>(
      `/search?${params.toString()}`
    );

  return {
    tracks: result.tracks?.items ?? [],
    artists: result.artists?.items ?? [],
    albums: result.albums?.items ?? [],
    playlists: result.playlists?.items ?? []
  };
}

export async function getPlaylist(
  playlistId: string
): Promise<SpotifyPlaylist> {
  const params = new URLSearchParams({
    market: 'US'
  });

  return spotifyFetch<SpotifyPlaylist>(
    `/playlists/${encodeURIComponent(playlistId)}?${params.toString()}`
  );
}

export async function getPlaylistItems(
  playlistId: string
): Promise<SpotifyPlaylistItem[]> {
  const allItems: SpotifyPlaylistItem[] = [];
  let offset = 0;

  while (true) {
    const params = new URLSearchParams({
      limit: '50',
      offset: String(offset),
      market: 'US'
    });

    const response =
      await spotifyFetch<SpotifyPlaylistItemsResponse>(
        `/playlists/${encodeURIComponent(
          playlistId
        )}/items?${params.toString()}`
      );

    allItems.push(...response.items);

    offset += response.items.length;

    if (
      !response.next ||
      response.items.length === 0 ||
      offset >= response.total
    ) {
      break;
    }
  }

  return allItems;
}

export function extractPlaylistId(
  value: string
): string | null {
  const trimmed = value.trim();

  const uriMatch = trimmed.match(
    /^spotify:playlist:([a-zA-Z0-9]+)$/
  );

  if (uriMatch) {
    return uriMatch[1];
  }

  try {
    const url = new URL(trimmed);

    if (
      url.hostname === 'open.spotify.com' &&
      url.pathname.startsWith('/playlist/')
    ) {
      const id = url.pathname
        .split('/')[2]
        ?.trim();

      return id || null;
    }
  } catch {
    return null;
  }

  return null;
}