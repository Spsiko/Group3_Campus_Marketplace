const KEY = 'cm_user';
export function getUser() {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
}
export function signOut() {
    localStorage.removeItem(KEY);
}
export async function signIn(email, password) {
    // Simulate I/O latency
    await new Promise(r => setTimeout(r, 500));
    // Simple validation rules (replace with real API later)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Please enter a valid email address.');
    }
    if (password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
    }
    // Demo rule: any valid email/password works. Use name from email prefix.
    const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const user = {
        email, name: name || 'Student',
        id: undefined,
        auth_user_id: undefined
    };
    localStorage.setItem(KEY, JSON.stringify(user));
    return user;
}
