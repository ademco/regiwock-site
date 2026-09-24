export interface Detected {
  platform: string;
  id: string;
  embed: string;
  thumbnail: string;
  vertical: boolean;
}
export declare const TYPES: readonly string[];
export declare const PLATFORMS: {
  youtube: string;
  twitch: string;
  kick: string;
  tiktok: string;
  instagram: string;
  spotify: string;
  soundcloud: string;
  applemusic: string;
  link: string;
};
export declare function detect(rawUrl: string): Detected;
export declare function oembedUrl(platform: string, url: string): string;
