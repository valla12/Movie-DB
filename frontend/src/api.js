// Use env variable in production, fallback to localhost for dev
export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
