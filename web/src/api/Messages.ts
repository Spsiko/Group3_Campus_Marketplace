import { supabase } from "../lib/supabaseClient";

export async function sendMessage({
  listingId,
  senderAuthId,
  receiverAuthId,
  content,
}: {
  listingId: string;
  senderAuthId: string;
  receiverAuthId: string;
  content: string;
}) {
  const topic = `listing:${listingId}`;

  const { error } = await supabase.from("messages").insert([
    {
      id: crypto.randomUUID(),
      listing_id: listingId,
      sender_auth_id: senderAuthId,
      receiver_auth_id: receiverAuthId,

      content,
      payload: null,
      private: true,

      event: "message",
      topic,
      extension: "chat",

      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      inserted_at: new Date(),
    },
  ]);

  return { error };
}
