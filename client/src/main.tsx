// Copyright (c) 2025-2026 Amarktai Network. All rights reserved.
import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from "@shared/const";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

// Initialize bootstrap modules (service worker, analytics) - MUST be imported before App
import { registerServiceWorker } from "./bootstrap";
import { initializeAnalytics } from "./analytics";

// Initialize admin toggle system - sets up console commands
// This must be imported to register showAdmin() and hideAdmin() functions
import "@/lib/adminToggle";

// Import upgrade modal state
import { useUpgradeModal } from "./hooks/useUpgradeModal";

// Initialize service worker and analytics
registerServiceWorker();
initializeAnalytics();

// Load visual configuration for post-deployment customization
fetch("/visual-config.json")
  .then((res) => res.json())
  .then((config) => {
    // Store config globally for components to access
    (window as any).__VISUAL_CONFIG__ = config;
    // Optionally apply colors to CSS variables
    if (config.colors) {
      const root = document.documentElement;
      Object.entries(config.colors).forEach(([key, value]) => {
        root.style.setProperty(`--visual-${key}`, value as string);
      });
    }
  })
  .catch((err) => {
    // Visual config is optional - silently continue if not available
    if (process.env.NODE_ENV === "development") {
      console.log("Visual config not loaded, using defaults:", err.message);
    }
  });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Do not retry on rate-limit (429) or auth errors — retrying floods the server
      retry: (failureCount, error) => {
        if (error instanceof TRPCClientError) {
          const code = (error as any)?.data?.code;
          if (
            code === "TOO_MANY_REQUESTS" ||
            code === "UNAUTHORIZED" ||
            code === "FORBIDDEN"
          )
            return false;
        }
        return failureCount < 1;
      },
      staleTime: 60 * 1000, // 1 minute default stale time
      // Disable automatic refetch on window focus globally to prevent request
      // storms when users switch tabs. Sensitive queries (auth.me) opt back in
      // explicitly with refetchOnWindowFocus: true at the call site.
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: false,
    },
  },
});

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

const handleTrialLockError = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;

  // Check for 402 Payment Required or trial/subscription error messages
  const isPaymentRequired =
    error.data?.code === "PAYMENT_REQUIRED" ||
    error.message?.toLowerCase().includes("trial") ||
    error.message?.toLowerCase().includes("subscription") ||
    error.message?.toLowerCase().includes("upgrade");

  if (isPaymentRequired) {
    // Open upgrade modal
    const { open } = useUpgradeModal.getState();

    if (error.message?.toLowerCase().includes("trial")) {
      open("trial_expired", error.message);
    } else if (error.message?.toLowerCase().includes("subscription")) {
      open("subscription_expired", error.message);
    } else {
      open("payment_required", error.message);
    }
  }
};

queryClient.getQueryCache().subscribe((event) => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    handleTrialLockError(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe((event) => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    handleTrialLockError(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>,
);
