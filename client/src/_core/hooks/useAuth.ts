// Copyright (c) 2025-2026 Amarktai Network. All rights reserved.
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

/** Clear all client-side auth state from storage */
function clearLocalAuthState() {
  localStorage.removeItem("equiprofile-user-info");
  sessionStorage.removeItem("equiprofile-user-info");
}

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: 1,
    retryDelay: 1000,
    // Keep staleTime short so that after logout the next mount always
    // fetches a fresh session check rather than serving stale data.
    staleTime: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      // Immediately clear TRPC cache for the "me" query
      utils.auth.me.setData(undefined, null);
      // Clear all client-side auth storage
      clearLocalAuthState();
      // Invalidate all cached queries so no stale data remains
      utils.invalidate();
      // Hard navigate to login — this also clears in-memory React state
      window.location.href = "/login";
    },
    onError: () => {
      // Even on error, ensure client state is cleared
      clearLocalAuthState();
      utils.auth.me.setData(undefined, null);
      utils.invalidate();
      window.location.href = "/login";
    },
  });

  const logout = useCallback(async () => {
    // Eagerly clear local state before the request completes
    clearLocalAuthState();
    utils.auth.me.setData(undefined, null);
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        // Already logged out on server — still clean up client state
        utils.invalidate();
        window.location.href = "/login";
        return;
      }
      throw error;
    } finally {
      // Guarantee cache is always cleared
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => {
    return {
      user: meQuery.data ?? null,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  // Persist user info to localStorage for offline/quick reads (side effect).
  // Cleared explicitly on logout via clearLocalAuthState(); also cleared here
  // when the server returns null/undefined (session expired or revoked).
  useEffect(() => {
    if (meQuery.data) {
      localStorage.setItem(
        "equiprofile-user-info",
        JSON.stringify(meQuery.data),
      );
    } else if (meQuery.data === null) {
      // Server explicitly returned null — session is gone; clear cached identity
      clearLocalAuthState();
    }
  }, [meQuery.data]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
