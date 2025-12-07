// src/lib/notifyExtras.ts
import { supabase } from "./supabaseClient";

// -------------------------------------------
// Helpers: map auth_user_id → internal users.id
// -------------------------------------------
async function getInternalUserId(authUserId: string): Promise<string | null> {
  if (!authUserId) return null;

  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("auth_user_id", authUserId)
    .single();

  if (error || !data) {
    console.error("Internal user lookup failed:", error);
    return null;
  }

  return data.id;
}

// -------------------------------------------
// Helpers: get readable name
// -------------------------------------------
async function getUserNameFromInternalId(id: string): Promise<string> {
  const { data, error } = await supabase
    .from("users")
    .select("full_name, email")
    .eq("id", id)
    .single();

  if (error || !data) return "User";

  return data.full_name || data.email || "User";
}

// ============================================================================
// 1. MESSAGE NOTIFICATIONS (for seller)
// ============================================================================
export async function notifyMessageSender(
  senderAuthId: string,     // sender auth_user_id
  receiverAuthId: string,   // receiver auth_user_id (seller)
  listingTitle: string,     // product title
  messageContent: string    // actual message sent
) {
  try {
    // Convert auth IDs → internal IDs
    const senderInternalId = await getInternalUserId(senderAuthId);
    const receiverInternalId = await getInternalUserId(receiverAuthId);

    if (!senderInternalId || !receiverInternalId) return;

    // Get sender’s real name
    const senderName = await getUserNameFromInternalId(senderInternalId);

    // Insert notification
    const { error } = await supabase.from("notifications").insert({
      user_id: receiverInternalId,
      user_name: senderName,
      action: `New message about "${listingTitle}": ${messageContent}`,
      status: "active",
    });

    if (error) console.error("Message notification insert failed:", error);
  } catch (err) {
    console.error("notifyMessageSender error:", err);
  }
}

// ============================================================================
// 2. REPORT NOTIFICATIONS (for seller of listing)
// ============================================================================
export async function notifyReportFiled(
  reporterAuthId: string,   // person who filed report
  sellerAuthId: string,     // listing owner (seller)
  listingTitle: string,     // product title
  category: string          // report category
) {
  try {
    const reporterInternalId = await getInternalUserId(reporterAuthId);
    const sellerInternalId = await getInternalUserId(sellerAuthId);

    if (!reporterInternalId || !sellerInternalId) return;

    // Get real name of reporter
    const reporterName = await getUserNameFromInternalId(reporterInternalId);

    const { error } = await supabase.from("notifications").insert({
      user_id: sellerInternalId,
      user_name: reporterName,
      action: `Your listing "${listingTitle}" has been reported for: ${category}`,
      status: "active",
    });

    if (error) console.error("Report notification insert failed:", error);
  } catch (err) {
    console.error("notifyReportFiled error:", err);
  }
}
