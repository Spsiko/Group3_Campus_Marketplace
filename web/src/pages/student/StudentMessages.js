import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/student/StudentMessages.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { getResolvedUserSync } from "../../lib/resolvedUser";
import "../../style/studentmessages.scss";
export default function StudentMessages() {
    const current = getResolvedUserSync();
    const myId = current?.auth_user_id || "";
    const [conversations, setConversations] = useState([]);
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        if (!myId)
            return;
        loadConversations(myId);
    }, [myId]);
    async function loadConversations(userId) {
        setLoaded(false);
        // 1) Load all messages where I am sender or receiver
        const { data, error } = await supabase
            .from("messages")
            .select("*")
            .or(`sender_auth_id.eq.${userId},receiver_auth_id.eq.${userId}`)
            .order("created_at", { ascending: false });
        if (error || !data) {
            console.error("Messages list error:", error);
            setConversations([]);
            setLoaded(true);
            return;
        }
        const msgs = data;
        // 2) For each thread, keep only the latest message:
        //    key = `${listing_id}::${otherUserId}`
        const latestByKey = {};
        for (const msg of msgs) {
            const otherId = msg.sender_auth_id === userId
                ? msg.receiver_auth_id
                : msg.sender_auth_id;
            const key = `${msg.listing_id}::${otherId}`;
            if (!latestByKey[key]) {
                latestByKey[key] = msg;
            }
        }
        const keys = Object.keys(latestByKey);
        if (keys.length === 0) {
            setConversations([]);
            setLoaded(true);
            return;
        }
        // 3) Fetch other users' display names from `users`
        const otherUserIds = [...new Set(keys.map((k) => k.split("::")[1]))];
        const { data: userRows, error: usersErr } = await supabase
            .from("users")
            .select("auth_user_id, full_name, email")
            .in("auth_user_id", otherUserIds);
        if (usersErr) {
            console.error("Users lookup error:", usersErr);
        }
        const nameMap = {};
        (userRows || []).forEach((u) => {
            nameMap[u.auth_user_id] = u.full_name || u.email || "User";
        });
        // 4) Build conversation items
        const convs = keys.map((key) => {
            const [listing_id, otherId] = key.split("::");
            const lastMsg = latestByKey[key];
            return {
                listing_id,
                otherId,
                otherName: nameMap[otherId] || "User",
                lastMessage: lastMsg.content,
                created_at: lastMsg.created_at,
            };
        });
        setConversations(convs);
        setLoaded(true);
    }
    if (!myId) {
        return (_jsxs("div", { style: { padding: 20 }, children: [_jsx("h1", { children: "Messages" }), _jsx("p", { children: "Please sign in to view your messages." })] }));
    }
    if (!loaded) {
        return _jsx("div", { style: { padding: 20 }, children: "Loading messages\u2026" });
    }
    return (_jsxs("div", { className: "messages-page", children: [_jsx("h1", { children: "Messages" }), _jsx("div", { className: "messages-list", children: conversations.map((c) => (_jsxs(Link, { to: `/student/messages/${c.listing_id}/${c.otherId}`, className: "msg-row", children: [_jsxs("div", { className: "msg-top", children: [_jsx("strong", { className: "msg-name", children: c.otherName }), _jsx("small", { className: "msg-time", children: new Date(c.created_at).toLocaleString() })] }), _jsx("div", { className: "msg-last", children: c.lastMessage })] }, `${c.listing_id}-${c.otherId}`))) })] }));
    /*
    return (
      <div style={{ padding: 20 }}>
        <h1>Messages</h1>
  
        {conversations.length === 0 && <p>No conversations yet.</p>}
  
        {conversations.map((c) => (
          <Link
            key={`${c.listing_id}-${c.otherId}`}
            to={`/student/messages/${c.listing_id}/${c.otherId}`}
            className="msg-thread"
          >
            <strong>{c.otherName}</strong>
            <div className="msg-last-line">{c.lastMessage}</div>
            <small className="msg-timestamp">
              {new Date(c.created_at).toLocaleString()}
            </small>
          </Link>
        ))}
      </div>
    );
    */
}
