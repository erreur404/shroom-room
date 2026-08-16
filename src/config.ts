export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string) ||
  `http://localhost:${import.meta.env.VITE_SERVER_PORT || '3002'}`;
