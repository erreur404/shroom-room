export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_API_URL as string)) ||
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV ? `http://localhost:${import.meta.env.VITE_SERVER_PORT || '3002'}` : 'http://localhost:3002');

