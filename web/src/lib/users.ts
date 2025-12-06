// src/lib/users.ts
import { supabase } from "./supabaseClient";

// Cache map
const userCache: Record<string, string> = {};

export async function getUserName(userId: string): Promise<string> {
  if (userCache[userId]) return userCache[userId];

  const { data, error } = await supabase
    .from("profiles") 
    .select("full_name")
    .eq("id", userId)
    .single();

  if (error || !data) return "Unknown";

  userCache[userId] = data.full_name;

  return data.full_name;
}
