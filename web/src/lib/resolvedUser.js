// src/lib/resolvedUser.ts
import { supabase } from "./supabaseClient";
import { getUser } from "./auth";
/**
 * Returns the "real" user from DB.users table.
 * Also updates localStorage to ensure the user is always resolved.
 */
export async function getResolvedUser() {
    const local = getUser();
    if (!local?.email)
        return null;
    // Look up the user in your `users` table
    const { data, error } = await supabase
        .from("users")
        .select("auth_user_id, full_name, email")
        .eq("email", local.email)
        .single();
    if (error || !data) {
        console.warn("Could not resolve user from users table:", error);
        return null;
    }
    const resolved = {
        auth_user_id: data.auth_user_id,
        email: data.email,
        full_name: data.full_name || data.email,
    };
    // Store resolved info for later usage (optional)
    localStorage.setItem("cm_resolved_user", JSON.stringify(resolved));
    return resolved;
}
/** Read resolved user from storage synchronously */
export function getResolvedUserSync() {
    const raw = localStorage.getItem("cm_resolved_user");
    return raw ? JSON.parse(raw) : null;
}
