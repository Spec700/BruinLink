"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { signIn as serverSignIn, signOut as serverSignOut } from "@/actions/auth";

type AuthState = {
  signedIn: boolean;
  clubSlug: string | null;
  clubName: string | null;
};

type AuthContextValue = AuthState & {
  signIn: (
    slug: string,
    pin: string
  ) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

type AuthProviderProps = {
  initialSlug: string | null;
  initialClubName: string | null;
  children: ReactNode;
};

export function AuthProvider({
  initialSlug,
  initialClubName,
  children,
}: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    signedIn: initialSlug !== null,
    clubSlug: initialSlug,
    clubName: initialClubName,
  });

  const signIn = useCallback(
    async (
      slug: string,
      pin: string
    ): Promise<{ ok: boolean; error?: string }> => {
      const result = await serverSignIn(slug, pin);
      if (result.ok) {
        setState({
          signedIn: true,
          clubSlug: slug,
          clubName: result.clubName,
        });
      }
      return { ok: result.ok, error: result.error };
    },
    []
  );

  const signOut = useCallback(async () => {
    await serverSignOut();
    setState({ signedIn: false, clubSlug: null, clubName: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
