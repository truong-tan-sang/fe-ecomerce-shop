"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { MessageSquare, X, Send, Loader2, Wifi, WifiOff } from "lucide-react";
import { useChatSocket, ChatMessage } from "@/hooks/useChatSocket";
import { chatService } from "@/services/chat";
import { ChatMessageDto, ChatRoomDto } from "@/dto/chat";
import { ApiError } from "@/utils/api-error";

export default function FloatingChat() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(false);

  const accessToken = session?.user?.access_token ?? null;
  const currentUserEmail = session?.user?.email ?? null;
  const userId = session?.user?.id ? String(session.user.id) : null;
  const supportRoomName = userId ? `support-${userId}` : null;

  const handleIncoming = useCallback((msg: ChatMessage) => {
    // Ignore echo of own messages — already shown via optimistic update
    if (msg.isMine) return;
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
    if (!openRef.current) setUnreadCount((c) => c + 1);
  }, []);

  const handleAddedToRoom = useCallback((roomName: string) => {
    if (roomName === supportRoomName) {
      console.log("[FloatingChat] Admin added us to room:", roomName);
      setHistoryLoaded(false);
    }
  }, [supportRoomName]);

  const { connected, sendRoomMessage, createRoom } = useChatSocket({
    accessToken,
    currentUserEmail,
    onMessage: handleIncoming,
    onAddedToRoom: handleAddedToRoom,
  });

  // Sync ref so handleIncoming can read open state without a stale closure
  useEffect(() => { openRef.current = open; }, [open]);

  // Clear unread count when chat panel opens
  useEffect(() => {
    if (open) setUnreadCount(0);
  }, [open]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // Load message history and ensure room exists when chat opens
  useEffect(() => {
    if (!open || !accessToken || !userId || !supportRoomName || historyLoaded) return;

    async function loadHistory() {
      if (!accessToken || !userId || !supportRoomName) return;
      setLoading(true);
      try {
        console.log("[FloatingChat] Loading rooms for user:", userId);
        const roomsRes = await chatService.getAllRooms(accessToken);
        const rooms = (roomsRes?.data ?? []) as ChatRoomDto[];
        const alreadyInRoom = rooms.some((r) => r.name === supportRoomName);

        if (!alreadyInRoom) {
          // First time: create the room via WebSocket (creates membership + joins socket)
          const displayName =
            (session?.user as { name?: string } | undefined)?.name ??
            currentUserEmail ??
            "Khách hàng";
          console.log("[FloatingChat] Creating support room:", supportRoomName);
          createRoom(supportRoomName, displayName);
          // Room is new — no history to load
          setHistoryLoaded(true);
          return;
        }

        // Room exists — socket already joined via initJoin on connect
        console.log("[FloatingChat] Found support room:", supportRoomName);
        try {
          const msgRes = await chatService.getRoomMessages(
            supportRoomName,
            accessToken,
            1,
            30
          );
          if (msgRes?.data) {
            const history = (msgRes.data as ChatMessageDto[])
              .slice()
              .reverse()
              .map((m) => ({
                id: `hist-${m.id}`,
                senderEmail: m.senderId.toString(),
                text: m.content,
                isMine: m.senderId === Number(userId),
                timestamp: new Date(m.createdAt),
              }));
            setMessages(history);
          }
        } catch (err) {
          if (err instanceof ApiError && err.statusCode === 404) {
            // Room exists in membership but no messages yet
            console.log("[FloatingChat] No messages yet in support room");
          } else {
            throw err;
          }
        }
      } catch (err) {
        console.error("[FloatingChat] Failed to load history:", err);
      } finally {
        setLoading(false);
        setHistoryLoaded(true);
      }
    }

    loadHistory();
  }, [open, accessToken, userId, supportRoomName, historyLoaded, session, currentUserEmail, createRoom]);

  function handleSend() {
    const text = input.trim();
    if (!text || !connected || !supportRoomName) return;

    const sent = sendRoomMessage(supportRoomName, text);
    if (!sent) return;

    const optimisticMsg: ChatMessage = {
      id: `opt-${Date.now()}`,
      senderEmail: currentUserEmail ?? "me",
      text,
      isMine: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // All hooks are above — safe to return early now
  if (pathname?.startsWith("/admin")) return null;
  if (!session) return null;

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-20 right-6 z-50 w-80 flex flex-col bg-white border border-black shadow-2xl"
          style={{ height: "420px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-black text-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} />
              <span className="font-semibold text-sm">Hỗ trợ khách hàng</span>
              {connected ? (
                <Wifi size={12} className="text-green-400" />
              ) : (
                <WifiOff size={12} className="text-red-400" />
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="cursor-pointer hover:opacity-70 transition-opacity"
              aria-label="Đóng chat"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-gray-50">
            {loading && (
              <div className="flex items-center justify-center h-full">
                <Loader2 size={20} className="animate-spin text-gray-400" />
              </div>
            )}

            {!loading && messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-gray-400 text-center">
                  Gửi tin nhắn để bắt đầu trò chuyện với bộ phận hỗ trợ.
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-3 py-2 text-sm ${
                    msg.isMine
                      ? "bg-black text-white"
                      : "bg-white border border-gray-200 text-black"
                  }`}
                >
                  {!msg.isMine && (
                    <p className="text-[10px] font-medium mb-1 opacity-60">
                      Hỗ trợ
                    </p>
                  )}
                  <p className="leading-snug">{msg.text}</p>
                  <p
                    className={`text-[10px] mt-1 ${msg.isMine ? "text-gray-300" : "text-gray-400"} text-right`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-center border-t border-gray-200 bg-white flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={connected ? "Nhập tin nhắn..." : "Đang kết nối..."}
              disabled={!connected}
              className="flex-1 px-4 py-3 text-sm outline-none bg-transparent disabled:opacity-50 placeholder:text-gray-400"
            />
            <button
              onClick={handleSend}
              disabled={!connected || !input.trim()}
              className="cursor-pointer p-3 text-black hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Gửi tin nhắn"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setOpen((v) => !v)}
          className="relative w-12 h-12 bg-black text-white flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors cursor-pointer"
          aria-label={open ? "Đóng chat" : "Mở hỗ trợ khách hàng"}
        >
          {open ? <X size={20} /> : <MessageSquare size={20} />}
          {!open && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>
    </>
  );
}
