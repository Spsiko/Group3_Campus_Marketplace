// authForStudent.ts
import { supabase } from "./supabaseClient";
const KEY = "cm_user";
// Read student session
export function getStudentUser() {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
}
// Log out
export function studentSignOut() {
    localStorage.removeItem(KEY);
}
// Student login (using your custom users table)
export async function studentSignIn(email, password) {
    const { data, error } = await supabase
        .from("users")
        .select("id, auth_user_id, full_name, email, role, password")
        .eq("email", email)
        .eq("password", password)
        .single();
    if (error || !data) {
        throw new Error("Invalid email or password");
    }
    const user = {
        id: data.id,
        auth_user_id: data.auth_user_id,
        full_name: data.full_name,
        email: data.email,
        role: data.role,
    };
    localStorage.setItem(KEY, JSON.stringify(user));
    return user;
}
