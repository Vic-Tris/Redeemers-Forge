import type { ReactNode } from "react";
import {
  useUser as useClerkUser,
  useClerk as useClerkClerk,
  Show as ClerkShow,
} from "@clerk/react";

/**
 * Whether a real Clerk publishable key is configured.
 *
 * `import.meta.env.VITE_CLERK_PUBLISHABLE_KEY` is statically replaced by Vite at
 * build time, so `HAS_CLERK` becomes a literal and the unused branch below is
 * eliminated. This keeps the rules-of-hooks branch stable for the whole app
 * lifetime, letting the UI render even when Clerk is not set up.
 */
export const HAS_CLERK = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

type ClerkShowWhen = "signed-in" | "signed-out";

interface ShowProps {
  when: ClerkShowWhen;
  fallback?: ReactNode;
  children?: ReactNode;
}

/**
 * Returns the current user in the same shape Clerk's `useUser` provides.
 * When Clerk is not configured, reports a loaded, signed-out state.
 */
export function useUser() {
  if (HAS_CLERK) {
    return useClerkUser();
  }
  return {
    user: null,
    isLoaded: true,
    isSignedIn: false as boolean,
  };
}

/**
 * Mirrors Clerk's `useClerk`. Without a key, `signOut` is a no-op.
 */
export function useClerk() {
  if (HAS_CLERK) {
    return useClerkClerk();
  }
  return {
    signOut: async () => {},
  };
}

/**
 * Mirrors Clerk's `<Show>`. Without a key, treats the visitor as signed-out.
 */
export function Show({ when, fallback = null, children }: ShowProps) {
  if (HAS_CLERK) {
    return (
      <ClerkShow when={when} fallback={fallback}>
        {children}
      </ClerkShow>
    );
  }
  if (when === "signed-out") {
    return <>{children}</>;
  }
  return <>{fallback}</>;
}
