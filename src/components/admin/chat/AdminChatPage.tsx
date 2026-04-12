"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { MessageSquare, Send, Wifi, WifiOff, Loader2, Users } from "lucide-react";
import { useChatSocket, ChatMessage } from "@/hooks/useChatSocket";
import { chatService } from "@/services/chat";
import { ChatMessageDto, ChatRoomDto } from "@/dto/chat";

// Extract the other participant's email from a private room name.
// Room name is `emailA-emailB` (lexicographic). Strip the current user's email.
function getPeerLabel(roomName: string, myEmail: string): string {
  const withoutMine = roomName.replace(myEmail, "").replace(/^-|-$/, "");
  return withoutMine || roomName;
}

// Get the other member's userId from a room's members list
function getPeerUserId(
  room: ChatRoomDto,
  myUserId: number
): string | null {
  const other = room.members?.find((m) => m.userId !== myUserId);
  return other ? String(other.userId) : null;
}

export default function AdminChatPage() {
  const { data: session } = useSession();
  const accessToken = session?.user?.access_token ?? null;
  const currentUserEmail = session?.user?.email ?? null;
  const myUserId = session?.user?.id ? Number(session.user.id) : null;

  const [rooms, setRooms] = useState<ChatRoomDto[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState<ChatRoomDto | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [input, setInput] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleIncoming = useCallback(
    (msg: ChatMessage) => {
      // Ignore echo of own messages — already shown via optimistic update
      if (msg.isMine) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    },
    []
  );

  const { connected, sendPrivateMessage } = useChatSocket({
    accessToken,
    currentUserEmail,
    onMessage: handleIncoming,
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load all rooms on mount
  useEffect(() => {
    if (!accessToken) return;

    async function loadRooms() {
      if (!accessToken) return;
      setRoomsLoading(true);
      try {
        const res = await chatService.getAllRooms(accessToken);
        if (res?.data) {
          const all = res.data as ChatRoomDto[];
          // Admin sees all rooms; show private ones first
          const sorted = [...all].sort((a, b) =>
            Number(b.isPrivate) - Number(a.isPrivate)
          );
          setRooms(sorted);
        }
      } catch (err) {
        console.error("[AdminChat] Failed to load rooms:", err);
      } finally {
        setRoomsLoading(false);
      }
    }

    loadRooms();
  }, [accessToken]);

  // Load message history when active room changes
  useEffect(() => {
    if (!activeRoom || !accessToken) return;

    async function loadMessages() {
      if (!activeRoom || !accessToken) return;
      setMessagesLoading(true);
      setMessages([]);
      try {
        const res = await chatService.getRoomMessages(
          activeRoom.name,
          accessToken,
          1,
          50
        );
        if (res?.data) {
          const history = (res.data as ChatMessageDto[])
            .slice()
            .reverse()
            .map((m) => ({
              id: `hist-${m.id}`,
              senderEmail: String(m.senderId),
              text: m.content,
              isMine: m.senderId === myUserId,
              timestamp: new Date(m.createdAt),
            }));
          setMessages(history);
        }
      } catch (err) {
        console.error("[AdminChat] Failed to load messages:", err);
      } finally {
        setMessagesLoading(false);
      }
    }

    loadMessages();
  }, [activeRoom, accessToken, myUserId]);

  function handleSend() {
    const text = input.trim();
    if (!text || !connected || !activeRoom || myUserId === null) return;

    const peerId = getPeerUserId(activeRoom, myUserId);
    if (!peerId) return;

    const sent = sendPrivateMessage(peerId, text);
    if (!sent) return;

    const optimistic: ChatMessage = {
      id: `opt-${Date.now()}`,
      senderEmail: currentUserEmail ?? "admin",
      text,
      isMine: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const privateRooms = rooms.filter((r) => r.isPrivate);
  const publicRooms = rooms.filter((r) => !r.isPrivate);

  return (
    <div className="flex h-full bg-white rounded-lg overflow-hidden shadow">
      {/* Left panel — room list */}
      <div className="w-72 border-r border-gray-200 flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="font-bold text-lg">Chat</h1>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              {connected ? (
                <><Wifi size={13} className="text-green-500" /> Trực tuyến</>
              ) : (
                <><WifiOff size={13} className="text-red-400" /> Ngoại tuyến</>
              )}
            </div>
          </div>
        </div>

        {/* Room list */}
        <div className="flex-1 overflow-y-auto">
          {roomsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-gray-400" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="px-4 py-8 text-sm text-gray-400 text-center">
              Chưa có cuộc trò chuyện nào
            </div>
          ) : (
            <>
              {privateRooms.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Tin nhắn riêng
                  </div>
                  {privateRooms.map((room) => (
                    <RoomItem
                      key={room.id}
                      room={room}
                      myEmail={currentUserEmail ?? ""}
                      active={activeRoom?.id === room.id}
                      onClick={() => setActiveRoom(room)}
                    />
                  ))}
                </div>
              )}
              {publicRooms.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Phòng chung
                  </div>
                  {publicRooms.map((room) => (
                    <RoomItem
                      key={room.id}
                      room={room}
                      myEmail={currentUserEmail ?? ""}
                      active={activeRoom?.id === room.id}
                      onClick={() => setActiveRoom(room)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right panel — chat area */}
      {activeRoom ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 bg-[var(--admin-green-dark)] flex items-center justify-center text-white text-sm font-bold shrink-0">
              {activeRoom.isPrivate ? (
                getPeerLabel(activeRoom.name, currentUserEmail ?? "").charAt(0).toUpperCase()
              ) : (
                <Users size={16} />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">
                {activeRoom.isPrivate
                  ? getPeerLabel(activeRoom.name, currentUserEmail ?? "")
                  : activeRoom.name}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-gray-50">
            {messagesLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 size={20} className="animate-spin text-gray-400" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-gray-400">
                  Chưa có tin nhắn. Hãy bắt đầu trò chuyện.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}
                >
                  {!msg.isMine && (
                    <div className="w-7 h-7 bg-gray-300 flex items-center justify-center text-xs font-bold text-white mr-2 shrink-0 self-end">
                      {msg.senderEmail.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div
                    className={`max-w-[60%] px-4 py-2.5 text-sm rounded-lg ${
                      msg.isMine
                        ? "bg-[var(--admin-green-dark)] text-white rounded-br-none"
                        : "bg-white border border-gray-200 text-black rounded-bl-none"
                    }`}
                  >
                    <p className="leading-snug">{msg.text}</p>
                    <p className={`text-[10px] mt-1 text-right ${msg.isMine ? "text-gray-400" : "text-gray-400"}`}>
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 bg-white flex items-center px-2 flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={connected ? "Nhập tin nhắn…" : "Đang kết nối…"}
              disabled={!connected}
              className="flex-1 px-4 py-3.5 text-sm outline-none bg-transparent disabled:opacity-50 placeholder:text-gray-400"
            />
            <button
              onClick={handleSend}
              disabled={!connected || !input.trim()}
              className="cursor-pointer p-3 text-black hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
          <MessageSquare size={48} className="mb-3 opacity-30" />
          <p className="text-sm">Chọn cuộc trò chuyện để bắt đầu</p>
        </div>
      )}
    </div>
  );
}

function RoomItem({
  room,
  myEmail,
  active,
  onClick,
}: {
  room: ChatRoomDto;
  myEmail: string;
  active: boolean;
  onClick: () => void;
}) {
  const label = room.isPrivate
    ? getPeerLabel(room.name, myEmail)
    : room.name;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
        active ? "bg-[var(--admin-green-light)] border-l-2 border-[var(--admin-green-dark)]" : "hover:bg-[var(--admin-green-light)]/50 border-l-2 border-transparent"
      }`}
    >
      <div className="w-9 h-9 bg-black flex items-center justify-center text-white text-sm font-bold shrink-0">
        {room.isPrivate ? label.charAt(0).toUpperCase() : <Users size={16} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm truncate ${active ? "font-semibold" : "font-medium"}`}>
          {label}
        </p>
      </div>
    </button>
  );
}
