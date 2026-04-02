export type Resolution = '1K' | '2K' | '4K';

export interface UploadedImage {
  url: string;
  base64: string;
  mimeType: string;
}

export interface GeneratedResult {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  resolution: Resolution;
}

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
