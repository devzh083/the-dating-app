// Base URL for the Django REST API, e.g. "http://localhost:8000/api" locally
// or "https://your-backend.onrender.com/api" in production.
// Set via VITE_API_URL in front-end/.env (see .env.example).
export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

// Root origin (no /api suffix) — for things like media/image URLs.
export const API_ORIGIN: string = API_BASE_URL.replace(/\/api\/?$/, "");

// Same origin, but with ws(s):// scheme — for WebSocket connections.
export const WS_ORIGIN: string = API_ORIGIN.replace(/^http/, "ws");
