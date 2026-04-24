import Header from "@/components/header/Navbar";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ProfileDataProvider from "@/components/profile/ProfileDataProvider";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <ProfileDataProvider>
        <main className="flex flex-1 gap-2 px-20 pt-32 md:pt-36">
          <ProfileSidebar />
          <div className="flex-1 py-6">{children}</div>
        </main>
      </ProfileDataProvider>
    </div>
  );
}
