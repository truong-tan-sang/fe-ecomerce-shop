import Header from "@/components/header/navbar";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ProfileDataProvider from "@/components/profile/ProfileDataProvider";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <ProfileDataProvider>
        <main className="flex flex-1 px-20 gap-2">
          <ProfileSidebar />
          <div className="flex-1 py-6">{children}</div>
        </main>
      </ProfileDataProvider>
    </div>
  );
}
