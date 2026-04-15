"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  MessageSquare,
  Send,
  Wifi,
  WifiOff,
  Loader2,
  Users,
  Clock,
} from "lucide-react";
import { useChatSocket, ChatMessage } from "@/hooks/useChatSocket";
import { chatService } from "@/services/chat";
import { ChatMessageDto, ChatRoomDto } from "@/dto/chat";
import { userService, getAvatarUrl } from "@/services/user";

// Extract the other participant's email from a private room name.
// Room name is `emailA-emailB` (lexicographic). Strip the current user's email.
function getPeerLabel(roomName: string, myEmail: string): string {
  const withoutMine = roomName.replace(myEmail, "").replace(/^-|-$/, "");
  return withoutMine || roomName;
}

// Get peer userId from a private room's members list (backward compat)
function getPeerUserId(room: ChatRoomDto, myUserId: number): string | null {
  const other = room.members?.find((m) => m.userId !== myUserId);
  return other ? String(other.userId) : null;
}

// Derive a human-readable label for a support room.
// Uses room description (set by customer at creation) with fallback to ID.
function getSupportRoomLabel(room: ChatRoomDto): string {
  if (room.description) return room.description;
  const match = room.name.match(/^support-(\d+)$/);
  return match ? `Khách hàng #${match[1]}` : room.name;
}

// Returns true if the room is a customer support room
function isSupportRoom(room: ChatRoomDto): boolean {
  return room.name.startsWith("support-");
}

// Minutes since a date
function minutesAgo(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
}

type SenderKind = "mine" | "customer" | "colleague";

interface SenderProfile {
  name: string;
  avatarUrl?: string;
}

export default function AdminChatPage() {
  const { data: session } = useSession();
  const accessToken = session?.user?.access_token ?? null;
  const currentUserEmail = session?.user?.email ?? null;
  const myUserId = session?.user?.id ? Number(session.user.id) : null;

  const [joinedRooms, setJoinedRooms] = useState<ChatRoomDto[]>([]);
  const [queueRooms, setQueueRooms] = useState<ChatRoomDto[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState<ChatRoomDto | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [input, setInput] = useState("");
  const [senderProfiles, setSenderProfiles] = useState<Record<string, SenderProfile>>({});
  // Customer's email — needed to classify real-time WS messages (which carry email, not numeric ID)
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  // Admin's own profile for the avatar shown on "mine" bubbles
  const [myProfile, setMyProfile] = useState<SenderProfile | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleIncoming = useCallback((msg: ChatMessage) => {
    if (msg.isMine) return;
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  const { connected, sendPrivateMessage, sendRoomMessage, joinRoom } =
    useChatSocket({
      accessToken,
      currentUserEmail,
      onMessage: handleIncoming,
    });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load rooms (joined + queue) — runs on mount and every 30s
  const loadRooms = useCallback(async () => {
    if (!accessToken) return;
    try {
      const [joinedRes, adminRes] = await Promise.all([
        chatService.getAllRooms(accessToken),
        chatService.getAdminRooms(accessToken).catch(() => null), // graceful until partner adds endpoint
      ]);

      const joined = (joinedRes?.data ?? []) as ChatRoomDto[];
      const joinedIds = new Set(joined.map((r) => r.id));

      const allSupportRooms = (adminRes?.data ?? []) as ChatRoomDto[];
      const queue = allSupportRooms.filter((r) => !joinedIds.has(r.id));

      setJoinedRooms(joined);
      setQueueRooms(queue);
    } catch (err) {
      console.error("[AdminChat] Failed to load rooms:", err);
    }
  }, [accessToken]);

  // Fetch admin's own profile once for avatar display on "mine" bubbles
  useEffect(() => {
    const userId = session?.user?.id;
    if (!accessToken || !userId) return;
    userService.getUserWithMedia(userId, accessToken).then((res) => {
      if (res?.data) {
        const d = res.data;
        const name =
          [d.firstName, d.lastName].filter(Boolean).join(" ") ||
          d.username ||
          d.email ||
          "Tôi";
        setMyProfile({ name, avatarUrl: getAvatarUrl(d.userMedia) ?? d.image });
      }
    }).catch(() => {/* silently ignore */});
  }, [accessToken, session?.user?.id]);

  useEffect(() => {
    if (!accessToken) return;
    setRoomsLoading(true);
    loadRooms().finally(() => setRoomsLoading(false));

    const interval = setInterval(loadRooms, 30_000);
    return () => clearInterval(interval);
  }, [accessToken, loadRooms]);

  // Classify message sender.
  // Historical messages carry senderEmail = String(senderId) — compare to numeric customerId.
  // Real-time WS messages carry senderEmail = sender's email — compare to fetched customerEmail.
  function classifyMessage(msg: ChatMessage, customerId: string | null): SenderKind {
    if (msg.isMine) return "mine";
    if (customerId && msg.senderEmail === customerId) return "customer"; // history
    if (customerEmail && msg.senderEmail === customerEmail) return "customer"; // real-time
    return "colleague";
  }

  // Load message history when active room changes
  useEffect(() => {
    if (!activeRoom || !accessToken) return;

    const customerIdMatch = activeRoom.name.match(/^support-(\d+)$/);
    const customerId = customerIdMatch?.[1] ?? null;
    setCustomerEmail(null); // reset on room switch

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
          await Promise.all([
            loadCustomerProfile(),
            loadColleagueProfiles(history),
          ]);
        }
      } catch (err) {
        console.error("[AdminChat] Failed to load messages:", err);
      } finally {
        setMessagesLoading(false);
      }
    }

    // Fetch customer profile for avatar + name
    async function loadCustomerProfile() {
      if (!customerId || !accessToken) return;
      if (senderProfiles[customerId]) return; // already cached
      try {
        const res = await userService.getUserWithMedia(customerId, accessToken);
        if (res?.data) {
          const d = res.data;
          const name =
            [d.firstName, d.lastName].filter(Boolean).join(" ") ||
            d.username ||
            d.email ||
            `Khách hàng #${customerId}`;
          const profileAvatarUrl = getAvatarUrl(d.userMedia) ?? d.image;
          setCustomerEmail(d.email || null);
          setSenderProfiles((prev) => ({
            ...prev,
            [customerId]: { name, avatarUrl: profileAvatarUrl },
          }));
        }
      } catch {
        // silently ignore
      }
    }

    // Fetch profiles for any colleague (admin) senders found in history
    async function loadColleagueProfiles(msgs: ChatMessage[]) {
      if (!accessToken) return;
      const seen = new Set<string>();
      for (const msg of msgs) {
        if (msg.isMine) continue;
        if (customerId && msg.senderEmail === customerId) continue;
        if (seen.has(msg.senderEmail) || senderProfiles[msg.senderEmail]) continue;
        seen.add(msg.senderEmail);
        try {
          const res = await userService.getUserWithMedia(msg.senderEmail, accessToken);
          if (res?.data) {
            const d = res.data;
            const name =
              [d.firstName, d.lastName].filter(Boolean).join(" ") ||
              d.username ||
              d.email ||
              "Đồng nghiệp";
            const profileAvatarUrl = getAvatarUrl(d.userMedia) ?? d.image;
            setSenderProfiles((prev) => ({
              ...prev,
              [msg.senderEmail]: { name, avatarUrl: profileAvatarUrl },
            }));
          }
        } catch {
          // silently ignore
        }
      }
    }

    loadMessages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRoom, accessToken, myUserId]);

  // Admin picks a room from the queue → join via WS + move to active
  function handlePickFromQueue(room: ChatRoomDto) {
    joinRoom(room.name);
    // Optimistically move from queue to joined
    setQueueRooms((prev) => prev.filter((r) => r.id !== room.id));
    setJoinedRooms((prev) => {
      if (prev.some((r) => r.id === room.id)) return prev;
      return [room, ...prev];
    });
    setActiveRoom(room);
  }

  function handleSend() {
    const text = input.trim();
    if (!text || !connected || !activeRoom || myUserId === null) return;

    let sent = false;
    if (activeRoom.isPrivate) {
      // Backward compat for any old private rooms
      const peerId = getPeerUserId(activeRoom, myUserId);
      if (!peerId) return;
      sent = sendPrivateMessage(peerId, text);
    } else {
      sent = sendRoomMessage(activeRoom.name, text);
    }

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

  function getRoomLabel(room: ChatRoomDto): string {
    if (room.isPrivate) return getPeerLabel(room.name, currentUserEmail ?? "");
    return getSupportRoomLabel(room);
  }

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
                <>
                  <Wifi size={13} className="text-green-500" /> Trực tuyến
                </>
              ) : (
                <>
                  <WifiOff size={13} className="text-red-400" /> Ngoại tuyến
                </>
              )}
            </div>
          </div>
        </div>

        {/* Room list */}
        <div className="flex-1 overflow-y-auto">
          {roomsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-[var(--admin-green-dark)]" />
            </div>
          ) : (
            <>
              {/* Queue section */}
              {queueRooms.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-[11px] font-semibold text-[var(--admin-green-dark)] uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={11} />
                    Chờ xử lý ({queueRooms.length})
                  </div>
                  {queueRooms.map((room) => (
                    <QueueRoomItem
                      key={room.id}
                      room={room}
                      label={getRoomLabel(room)}
                      onClick={() => handlePickFromQueue(room)}
                    />
                  ))}
                </div>
              )}

              {/* Active / joined section */}
              {joinedRooms.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Đang xử lý ({joinedRooms.length})
                  </div>
                  {joinedRooms.map((room) => (
                    <ActiveRoomItem
                      key={room.id}
                      room={room}
                      label={getRoomLabel(room)}
                      active={activeRoom?.id === room.id}
                      onClick={() => setActiveRoom(room)}
                    />
                  ))}
                </div>
              )}

              {queueRooms.length === 0 && joinedRooms.length === 0 && (
                <div className="px-4 py-8 text-sm text-gray-400 text-center">
                  Chưa có cuộc trò chuyện nào
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
            <div className="w-9 h-9 rounded-md bg-[var(--admin-green-mid)] flex items-center justify-center text-[var(--admin-green-dark)] text-sm font-bold shrink-0">
              {activeRoom.isPrivate ? (
                getPeerLabel(activeRoom.name, currentUserEmail ?? "")
                  .charAt(0)
                  .toUpperCase()
              ) : (
                <Users size={16} />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate text-[var(--admin-green-dark)]">
                {getRoomLabel(activeRoom)}
              </p>
              {!activeRoom.isPrivate && (
                <p className="text-xs text-gray-400 truncate">
                  {activeRoom.name}
                </p>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
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
              <MessageList
                messages={messages}
                myUserId={myUserId}
                activeRoom={activeRoom}
                senderProfiles={senderProfiles}
                myProfile={myProfile}
                classifyMessage={classifyMessage}
              />
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

// Message list with Messenger-style grouping and avatar circles
function MessageList({
  messages,
  myUserId,
  activeRoom,
  senderProfiles,
  myProfile,
  classifyMessage,
}: {
  messages: ChatMessage[];
  myUserId: number | null;
  activeRoom: ChatRoomDto | null;
  senderProfiles: Record<string, { name: string; avatarUrl?: string }>;
  myProfile: SenderProfile | null;
  classifyMessage: (msg: ChatMessage, customerId: string | null) => SenderKind;
}) {
  const customerIdMatch = activeRoom?.name.match(/^support-(\d+)$/);
  const customerId = customerIdMatch?.[1] ?? null;

  // Group consecutive messages from the same sender
  type Group = { senderId: string; kind: SenderKind; msgs: ChatMessage[] };
  const groups: Group[] = [];
  for (const msg of messages) {
    const kind = classifyMessage(msg, customerId);
    const senderId = msg.senderEmail;
    const last = groups[groups.length - 1];
    if (last && last.senderId === senderId) {
      last.msgs.push(msg);
    } else {
      groups.push({ senderId, kind, msgs: [msg] });
    }
  }

  return (
    <div className="space-y-1">
      {groups.map((group, gi) => {
        const profile =
          group.kind === "mine"
            ? myProfile
            : senderProfiles[group.senderId];
        const senderName =
          profile?.name ??
          (customerId && group.senderId === customerId
            ? `Khách hàng #${customerId}`
            : group.kind === "colleague"
            ? "Đồng nghiệp"
            : group.senderId);
        const avatarUrl = profile?.avatarUrl;

        // Only MY messages go on the right — customer and colleague both go left
        const isRight = group.kind === "mine";

        return (
          <div
            key={`group-${gi}`}
            className={`flex flex-col gap-0.5 mb-3 ${isRight ? "items-end" : "items-start"}`}
          >
            {/* Sender name — always visible for customer and colleague */}
            {group.kind !== "mine" && (
              <p className="text-[11px] text-gray-400 ml-9 mb-0.5">{senderName}</p>
            )}

            {group.msgs.map((msg, mi) => {
              const isLast = mi === group.msgs.length - 1;
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isRight ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar — left side only, shown on last bubble of each group */}
                  <div className={`w-7 h-7 shrink-0 ${isLast ? "visible" : "invisible"}`}>
                    {isLast && (
                      avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt={senderName}
                          width={28}
                          height={28}
                          className="rounded-full object-cover w-7 h-7"
                          unoptimized
                        />
                      ) : (
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            group.kind === "colleague" ? "bg-indigo-500" : "bg-gray-300"
                          }`}
                        >
                          {senderName.charAt(0).toUpperCase()}
                        </div>
                      )
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[70%] px-4 py-2.5 text-sm rounded-2xl ${
                      group.kind === "mine"
                        ? "bg-[var(--admin-green-dark)] text-white"
                        : group.kind === "colleague"
                        ? "bg-indigo-500 text-white"
                        : "bg-white border border-gray-200 text-black"
                    }`}
                  >
                    <p className="leading-snug">{msg.text}</p>
                    <p className="text-[10px] mt-1 text-right opacity-50">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// Queue room — unjoined, needs attention
function QueueRoomItem({
  room,
  label,
  onClick,
}: {
  room: ChatRoomDto;
  label: string;
  onClick: () => void;
}) {
  const isNew = minutesAgo(room.createdAt) < 10;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer bg-[var(--admin-green-light)] hover:bg-[var(--admin-green-mid)] border-l-2 border-[var(--admin-green-dark)]"
    >
      <div className="relative w-9 h-9 rounded-md bg-[var(--admin-green-mid)] flex items-center justify-center text-[var(--admin-green-dark)] text-sm font-bold shrink-0">
        <Users size={16} />
        {isNew && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[var(--admin-green-dark)] rounded-full animate-pulse" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate text-[var(--admin-green-dark)]">{label}</p>
        <p className="text-[11px] text-[var(--admin-green-dark)] opacity-60 mt-0.5">
          {isNew ? "Mới • " : ""}
          {minutesAgo(room.createdAt)} phút trước
        </p>
      </div>
    </button>
  );
}

// Active room — already joined
function ActiveRoomItem({
  room,
  label,
  active,
  onClick,
}: {
  room: ChatRoomDto;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer border-l-2 ${
        active
          ? "bg-[var(--admin-green-mid)] border-[var(--admin-green-dark)]"
          : "hover:bg-[var(--admin-green-light)] border-transparent"
      }`}
    >
      <div className={`w-9 h-9 rounded-md flex items-center justify-center text-sm font-bold shrink-0 ${
        active
          ? "bg-[var(--admin-green-dark)] text-white"
          : "bg-[var(--admin-green-mid)] text-[var(--admin-green-dark)]"
      }`}>
        {room.isPrivate ? (
          label.charAt(0).toUpperCase()
        ) : (
          <Users size={16} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm truncate ${
          active
            ? "font-semibold text-[var(--admin-green-dark)]"
            : "font-medium text-gray-700"
        }`}>
          {label}
        </p>
      </div>
    </button>
  );
}
