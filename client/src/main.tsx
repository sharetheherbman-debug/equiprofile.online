import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

// Initialize admin toggle system - sets up console commands
// This must be imported to register showAdmin() and hideAdmin() functions
import "@/lib/adminToggle";

// Load visual configuration for post-deployment customization
fetch('/visual-config.json')
  .then(res => res.json())
  .then(config => {
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
  .catch(err => {
    // Visual config is optional - silently continue if not available
    if (process.env.NODE_ENV === 'development') {
      console.log('Visual config not loaded, using defaults:', err.message);
    }
  });

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
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
  </trpc.Provider>
);
