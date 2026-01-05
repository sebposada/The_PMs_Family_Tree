/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

export type UserRole = "admin" | "user";

export interface UserWithProfile {
  id: number;
  email: string | null;
  name: string | null;
  role: UserRole;
  profile?: {
    displayName: string | null;
    approved: boolean;
  } | null;
}

export interface AuthState {
  user: UserWithProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isApproved: boolean;
  needsOnboarding: boolean;
}
