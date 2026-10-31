export const getFrontendUrl = () =>
    (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
