import { Suspense } from "react";
import AdminChatPage from "@/components/admin/chat/AdminChatPage";

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <AdminChatPage />
    </Suspense>
  );
}
