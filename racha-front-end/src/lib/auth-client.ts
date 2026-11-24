import { createAuthClient } from "better-auth/react";

const baseURL = (
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:5173")
).replace(/\/$/, "");

export const authClient = createAuthClient({
  baseURL,
});
