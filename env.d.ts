/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ODDS_API: string;
  readonly VITE_ODDS_APP: string;
  readonly VITE_KCAPP_API: string;
  readonly VITE_KCAPP_SOCKET: string;
  readonly VITE_KCAPP_SOCKET_PORT: string;
  readonly VITE_OFFICE_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
