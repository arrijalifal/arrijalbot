declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      BOT_TOKEN: string;
      BOT_CREATOR: number;
    }
  }
}

// If this file has no imports/exports, turn it into a module
export {};
