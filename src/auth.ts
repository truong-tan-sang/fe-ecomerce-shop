import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authService } from "./services/auth";
import {
  EmailNotFoundError,
  InactiveAccountError,
  InvalidEmailPasswordError,
} from "./utils/errors";
import { IUser } from "./types/next-auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        username: {},
        password: {},
      },
      authorize: async (credentials) => {
        console.log("Authorize called with credentials:", credentials);
        try {
          const res = await authService.login({
            username: credentials.username as string,
            password: credentials.password as string,
          });
          console.log("Response from backend:", res);

          return {
            id: String(res.data?.user?.id),
            name: res.data?.user?.name,
            email: res.data?.user?.email,
            access_token: res.data?.access_token,
            role: res.data?.user?.role,
            isAdmin: res.data?.user?.isAdmin,
          };
        } catch (error) {
          const { ApiError } = await import("@/utils/api-error");
          if (error instanceof ApiError) {
            console.log("[Auth] Login failed:", error.statusCode, error.message);
            if (error.statusCode === 404) {
              throw new EmailNotFoundError();
            } else if (error.statusCode === 401) {
              throw new InvalidEmailPasswordError();
            } else if (error.statusCode === 400) {
              throw new InactiveAccountError();
            }
          }
          throw new Error("Internal server error");
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login/",
    error: "/auth/login/",
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // User is available during sign-in
        token.user = {
          id: user.id || "",
          name: user.name || "",
          email: user.email || "",
          access_token: user.access_token || "",
          role: user.role,
          isAdmin: user.isAdmin,
          firstName: user.firstName,
          lastName: user.lastName,
          image: (user.image || undefined) as string | undefined,
        };
      }
      return token;
    },
    session({ session, token }) {
      (session.user as IUser) = token.user;
      return session;
    },
  },
});
