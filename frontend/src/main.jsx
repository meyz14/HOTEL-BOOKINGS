import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { AppProvider } from "./conext/AppContext.jsx";

import App from "./App.jsx";
import "./index.css";

// Clerk Publishable Key
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error(
    "Missing Clerk Publishable Key. Add VITE_CLERK_PUBLISHABLE_KEY to your .env file."
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={clerkPubKey}
      afterSignOutUrl="/"
    >
      <BrowserRouter>
      <AppProvider>
           <App />
      </AppProvider>
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>
);