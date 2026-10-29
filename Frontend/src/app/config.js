const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/+$/, "");

export { API_URL };