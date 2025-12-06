// src/types/messages.ts
export type DBMessage = {
  id: string;
  listing_id: string;
  sender_auth_id: string;
  receiver_auth_id: string;
  content: string;
  created_at: string;
};

export type ConversationItem = {
  listingId: string;
  otherUserId: string;
  otherName: string;
  lastMessage: string;
  created_at: string;
};
