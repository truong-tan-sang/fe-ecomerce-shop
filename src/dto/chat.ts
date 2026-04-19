export interface UserRoomChatDto {
  id: number;
  userId: number;
  roomChatId: number;
  createdAt: string;
}

export interface ChatRoomDto {
  id: number;
  name: string;
  description: string | null;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  members?: UserRoomChatDto[];
}

export interface ChatMessageDto {
  id: number;
  content: string;
  senderId: number;
  roomChatId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomDto {
  name: string;
  description?: string;
  isPrivate?: boolean;
}

export interface JoinRoomDto {
  name: string;
}

export interface AddUserToRoomDto {
  roomName: string;
  userId: number;
}

export interface CreateMessageDto {
  text: string;
  room_name: string;
}

export interface CreatePrivateMessageDto {
  text: string;
  receiver: string;
}

/** Payload shape emitted by server for both public and private messages */
export interface WsChatMessagePayload {
  name: string; // sender email
  text: string;
  room_name?: string;
}
