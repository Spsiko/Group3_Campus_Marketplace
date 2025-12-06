// src/lib/notifications.ts
import { supabase } from "./supabaseClient";

// Fetch full name from users table
async function getUserName(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    console.error("Failed to fetch user name:", error);
    return "User";
  }

  return data.full_name || "User";
}

export async function sendNotificationToUser(
  targetUserId: string,    // who receives the notification
  action: string,           // the text message
  triggeredByUserId?: string  // who caused the notification
) {
  if (!targetUserId) return;

  // If triggeredByUserId exists → use their real name
  const userName =
    triggeredByUserId ? await getUserName(triggeredByUserId) : "System";

  const record = {
    user_id: targetUserId,
    user_name: userName,   // <-- always REAL NAME saved
    action: action,
    status: "active",
  };

  console.log("INSERT NOTIFICATION:", record);

  const { error } = await supabase.from("notifications").insert(record);

  if (error) console.error("Failed to insert notification:", error);
}
