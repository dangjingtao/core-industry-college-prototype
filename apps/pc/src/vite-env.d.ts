/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_PLATFORM: "pc";
  readonly VITE_APP_ENV: "development" | "production";
  readonly VITE_PUBLIC_SITE_URL: string;
  readonly VITE_MOBILE_SITE_URL: string;
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
