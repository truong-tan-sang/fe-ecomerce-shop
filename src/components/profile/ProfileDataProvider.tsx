import { auth } from "@/auth";
import { userService } from "@/services/user";
import { ProfileContextProvider, ProfileData } from "./ProfileContext";

export default async function ProfileDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  let profile: ProfileData | null = null;

  try {
    if (session?.user?.access_token && session?.user?.id) {
      console.log("[ProfileDataProvider] Fetching user by id:", session.user.id);
      console.log("[ProfileDataProvider] Using access token (first 12 chars):", session.user.access_token?.slice(0, 12));
      const res = await userService.getUser(session.user.id, session.user.access_token);
      console.log("[ProfileDataProvider] /user/{id} response:", JSON.stringify(res, null, 2));
      if (res?.data) {
        const d: any = res.data;
        profile = {
          id: d.id || d._id || session.user.id,
          name: d.name || d.fullName || session.user.name,
          email: d.email || session.user.email,
          phone: d.phone,
          image: d.image || d.avatar,
          username: d.username,
          ...d,
        };
        if (profile) {
          console.log("[ProfileDataProvider] Normalized profile id:", profile.id);
        }
      } else {
        console.warn("[ProfileDataProvider] No 'data' in /user/{id} response. Full response:", res);
      }
    } else if (!session?.user?.id) {
      console.warn("[ProfileDataProvider] Missing session.user.id; cannot call /user/{id}");
    }
  } catch (e) {
    // Swallow errors and leave profile as null; UI can handle gracefully
    console.error("[ProfileDataProvider] Failed to fetch profile:", e);
    profile = null;
  }

  return <ProfileContextProvider value={profile}>{children}</ProfileContextProvider>;
}
