import { supabase } from "./supabaseClient";

// ---------------------------------------------------------
// Insert notification with REAL user_name
// ---------------------------------------------------------
export async function sendNotificationToUser(
  targetUserId: string,    // receiver
  action: string,          // message text
  actorName: string // person who triggered the event
) {
  if (!targetUserId) return;


  const record = {
    user_id: targetUserId,
    user_name: actorName || "User", // REAL sender name
    action: action,
    status: "active",
  };

  console.log("INSERT NOTIFICATION:", record);

  const { error } = await supabase.from("notifications").insert(record);

  if (error) console.error("Failed to insert notification:", error);
}
