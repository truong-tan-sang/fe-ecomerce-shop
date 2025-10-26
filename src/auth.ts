import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        console.log("Google profile:", profile);
        return {
          // Return all the profile information you need.
          // The only truly required field is `id`
          // to be able identify the account when added to a database
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
});
