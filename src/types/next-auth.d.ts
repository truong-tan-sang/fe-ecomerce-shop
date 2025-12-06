import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

type UserRole = "USER" | "ADMIN" | "OPERATOR" | "";

interface IUser {
  id: string;
  name: string;
  email: string;
  access_token: string;
  role?: UserRole;
  isAdmin?: boolean;
  firstName?: string;
  lastName?: string;
  image?: string;
}
declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    access_token: string;
    refresh_token: string;
    user: IUser;
    access_expire: number;
    error: string;
  }
}

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getToken` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: IUser;
    access_token: string;
    refresh_token: string;
    access_expire: number;
    error: string;
  }
}
