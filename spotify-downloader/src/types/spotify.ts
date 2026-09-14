export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  type: 'artist';
  uri: string;
  external_urls?: {
    spotify?: string;
  };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  album_type?: string;
  release_date?: string;
  total_tracks?: number;
  images: SpotifyImage[];
  artists: SpotifyArtist[];
  uri: string;
  external_urls?: {
    spotify?: string;
  };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  duration_ms: number;
  explicit?: boolean;
  popularity?: number;
  preview_url: string | null;
  uri: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  external_urls?: {
    spotify?: string;
  };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  public?: boolean | null;
  collaborative?: boolean;
  images: SpotifyImage[];
  owner?: {
    display_name: string | null;
    id: string;
  };
  items?: {
    total: number;
  };
  tracks?: {
    total: number;
  };
  uri: string;
  external_urls?: {
    spotify?: string;
  };
}

export interface SpotifyPlaylistItem {
  added_at?: string | null;
  item: SpotifyTrack | null;
}

export interface SpotifyPlaylistItemsResponse {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: SpotifyPlaylistItem[];
}

export interface SpotifySearchResponse {
  tracks?: {
    href: string;
    items: SpotifyTrack[];
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
  };
  artists?: {
    href: string;
    items: SpotifyArtist[];
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
  };
  albums?: {
    href: string;
    items: SpotifyAlbum[];
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
  };
  playlists?: {
    href: string;
    items: SpotifyPlaylist[];
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
  };
}

export interface SpotifyProfile {
  id: string;
  display_name: string | null;
  email?: string;
  images?: SpotifyImage[];
  country?: string;
  product?: string;
}

export interface SpotifyToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  expires_at: number;
}