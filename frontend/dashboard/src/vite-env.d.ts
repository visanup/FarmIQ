/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_WEBSOCKET_URL: string
  readonly VITE_ANALYTICS_API_URL: string
  readonly VITE_DEFAULT_TENANT_ID: string
  readonly VITE_TMD_API_TOKEN?: string
  readonly VITE_CUSTOMER_API_URL?: string
  readonly VITE_PERFORMANCE_API_URL?: string
  readonly VITE_WEIGHT_API_URL?: string
  readonly VITE_SENSOR_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}