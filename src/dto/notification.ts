export interface NotificationDto {
  id: string;
  title: string;
  content: string;
  type: "PERSONAL_NOTIFICATION" | "SHOP_NOTIFICATION";
  creatorId: string | null;
  recipientId: string | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}
