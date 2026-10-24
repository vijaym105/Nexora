// Public URL of the frontend. Set FRONTEND_URL in the deployed environment,
// e.g. https://your-app.vercel.app (no trailing slash needed).
// Read lazily so dotenv has already run.
export const getFrontendUrl = () =>
    (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
