/** Origins allowed to send Clerk session tokens (your Vite dev server). */
export const AUTHORIZED_PARTIES = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

export const clerkMiddlewareOptions = {
  authorizedParties: AUTHORIZED_PARTIES,
};
