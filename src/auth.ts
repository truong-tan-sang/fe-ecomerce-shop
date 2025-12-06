import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import Credentials from "next-auth/providers/credentials";
import { authService } from "./services/auth";
import {
  InactiveAccountError,
  InvalidEmailPasswordError,
} from "./utils/errors";
import { IUser } from "./types/next-auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      profile(profile) {
        console.log("Google profile:", profile);
        return {
          id: profile.sub || profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          firstName: profile.given_name || "",
          lastName: profile.family_name || "",
        };
      },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      profile(profile) {
        console.log("Facebook profile:", profile);
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.picture?.data?.url,
        };
      },
    }),
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        username: {},
        password: {},
      },
      authorize: async (credentials) => {
        console.log("Authorize called with credentials:", credentials);
        const res = await authService.login({
          username: credentials.username as string,
          password: credentials.password as string,
        });
        console.log("Response from backend:", res);

        if (res.statusCode === 201) {
          // return user object with their profile data
          return {
            id: res.data?.user?.id,
            name: res.data?.user?.name,
            email: res.data?.user?.email,
            access_token: res.data?.access_token,
            role: res.data?.user?.role,
            isAdmin: res.data?.user?.isAdmin,
          };
        } else if (+res.statusCode === 401) {
          throw new InvalidEmailPasswordError();
        } else if (+res.statusCode === 400) {
          throw new InactiveAccountError();
        } else {
          throw new Error("Internal server error");
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login/",
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      // For Google OAuth, sync with backend
      if (account?.provider === "google") {
        try {
          console.log("🔐 Google signIn callback triggered", { 
            userId: user.id, 
            email: user.email,
            provider: account.provider 
          });
          
          // Call backend to create/get user
          const createUserPayload = {
            firstName: (user as any).firstName || profile?.given_name || "",
            lastName: (user as any).lastName || profile?.family_name || "",
            gender: "OTHER",
            email: user.email || "",
            phone: "",
            googleId: user.id,
            username: user.email?.split("@")[0] || user.name || "",
            role: "USER",
            createdAt: new Date().toISOString(),
            isActive: true,
            codeActive: "",
            codeActiveExpire: new Date().toISOString(),
            staffCode: "",
            isAdmin: false,
            loyaltyCard: "",
          };

          console.log("📦 Creating user with payload:", JSON.stringify(createUserPayload, null, 2));

          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
          console.log("🌐 Backend URL:", backendUrl);

          const response = await fetch(`${backendUrl}/user/google-account`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(createUserPayload),
          });

          console.log("📊 Backend response status:", response.status, response.statusText);

          const responseText = await response.text();
          console.log("📄 Backend raw response:", responseText);

          if (!response.ok) {
            console.error("❌ Backend returned error status:", response.status);
            console.error("❌ Error response body:", responseText);
            return false;
          }

          let backendData;
          try {
            backendData = JSON.parse(responseText);
          } catch (parseError) {
            console.error("❌ Failed to parse backend response as JSON:", parseError);
            console.error("❌ Response was:", responseText);
            return false;
          }

          console.log("✅ Backend user response:", JSON.stringify(backendData, null, 2));

          // Attach backend data to user object for session
          const accessToken = backendData.data?.access_token;
          const role = backendData.data?.user?.role;
          const isAdmin = backendData.data?.user?.isAdmin;
          const userId = backendData.data?.user?.id;

          if (!accessToken) {
            console.error("❌ No access_token in backend response");
            return false;
          }

          user.access_token = accessToken;
          user.role = role;
          user.isAdmin = isAdmin;
          user.id = String(userId);

          console.log("✅ User data attached to session:", {
            id: user.id,
            email: user.email,
            role: user.role,
            isAdmin: user.isAdmin,
          });

          return true;
        } catch (error) {
          console.error("❌ Error syncing Google user with backend:", error);
          if (error instanceof Error) {
            console.error("❌ Error message:", error.message);
            console.error("❌ Error stack:", error.stack);
          }
          return false;
        }
      }
      
      return true;
    },
    jwt({ token, user, account }) {
      if (user) {
        // User is available during sign-in
        token.user = user as IUser;
      }
      return token;
    },
    session({ session, token }) {
      (session.user as IUser) = token.user;
      return session;
    },
  },
});
