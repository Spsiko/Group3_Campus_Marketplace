// authForStudent.ts
import { supabase } from "./supabaseClient";

export type StudentUser = {
  id: string;           // users.id
  auth_user_id: string; // users.auth_user_id
  full_name: string;
  email: string;
  role: string;
};

const KEY = "cm_user";

// Read student session
export function getStudentUser(): StudentUser | null {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) as StudentUser : null;
}

// Log out
export function studentSignOut() {
  localStorage.removeItem(KEY);
}

// Student login (using your custom users table)
export async function studentSignIn(email: string, password: string): Promise<StudentUser> {
  const { data, error } = await supabase
    .from("users")
    .select("id, auth_user_id, full_name, email, role, password")
    .eq("email", email)
    .eq("password", password)
    .single();

  if (error || !data) {
    throw new Error("Invalid email or password");
  }

  const user: StudentUser = {
    id: data.id,
    auth_user_id: data.auth_user_id,
    full_name: data.full_name,
    email: data.email,
    role: data.role,
  };

  localStorage.setItem(KEY, JSON.stringify(user));
  return user;
}
