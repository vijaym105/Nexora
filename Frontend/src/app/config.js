// Base URL of the backend. In production set VITE_API_URL (e.g. https://your-api.onrender.com)
// in the frontend host's environment variables, then rebuild.
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '')
