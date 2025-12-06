import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/student/StudentChat.tsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { getResolvedUserSync } from "../../lib/resolvedUser";
import "../../style/StudentChat.scss";
export default function StudentChat() {
    const { listingId, otherUserId } = useParams();
    const current = getResolvedUserSync();
    const myId = current?.auth_user_id || "";
    const [otherName, setOtherName] = useState("User");
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    // ---------------------------
    // Load other user's name
    // ---------------------------
    async function loadUserName(otherId) {
        const { data, error } = await supabase
            .from("users")
            .select("full_name, email")
            .eq("auth_user_id", otherId)
            .single();
        if (error || !data) {
            console.warn("Could not load other user name:", error);
            setOtherName("User");
            return;
        }
        setOtherName(data.full_name || data.email || "User");
    }
    // ---------------------------
    // Load messages for this chat
    // ---------------------------
    async function loadMessages(listingId, myId, otherId) {
        const { data, error } = await supabase
            .from("messages")
            .select("*")
            .eq("listing_id", listingId)
            .order("created_at", { ascending: true });
        if (error || !data) {
            console.error("Message load error:", error);
            setMessages([]);
            return;
        }
        const all = data;
        // Keep only messages between (myId, otherId) for this listing
        const filtered = all.filter((m) => (m.sender_auth_id === myId && m.receiver_auth_id === otherId) ||
            (m.sender_auth_id === otherId && m.receiver_auth_id === myId));
        setMessages(filtered);
    }
    // ---------------------------
    // Realtime subscription
    // ---------------------------
    function subscribeToRealtime(myId, listingId, otherId) {
        const channel = supabase
            .channel(`chat-${listingId}-${otherId}`)
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
            const msg = payload.new;
            const belongs = msg.listing_id === listingId &&
                ((msg.sender_auth_id === myId &&
                    msg.receiver_auth_id === otherId) ||
                    (msg.sender_auth_id === otherId &&
                        msg.receiver_auth_id === myId));
            if (belongs) {
                setMessages((prev) => [...prev, msg]);
            }
        })
            .subscribe();
        return channel;
    }
    // ---------------------------
    // Initial load + subscription
    // ---------------------------
    useEffect(() => {
        if (!listingId || !otherUserId || !myId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        loadUserName(otherUserId);
        loadMessages(listingId, myId, otherUserId).finally(() => setLoading(false));
        const channel = subscribeToRealtime(myId, listingId, otherUserId);
        return () => {
            supabase.removeChannel(channel);
        };
    }, [listingId, otherUserId, myId]);
    // ---------------------------
    // Send a message
    // ---------------------------
    async function sendMessage() {
        if (!listingId || !otherUserId || !myId)
            return;
        if (!newMessage.trim())
            return;
        const payload = {
            listing_id: listingId,
            sender_auth_id: myId,
            receiver_auth_id: otherUserId,
            content: newMessage.trim(),
        };
        const { error } = await supabase.from("messages").insert(payload);
        if (error) {
            console.error("Send error:", error);
            return;
        }
        setNewMessage("");
    }
    if (!listingId || !otherUserId) {
        return (_jsx("div", { className: "chat-page", children: _jsx("p", { children: "Invalid chat URL." }) }));
    }
    if (!myId) {
        return (_jsx("div", { className: "chat-page", children: _jsx("p", { children: "Please sign in to view messages." }) }));
    }
    return (_jsxs("div", { className: "chat-page", children: [_jsx(Link, { to: "/student/messages", className: "back-button", children: "\u2190 Back" }), _jsx("h2", { className: "chat-header", children: otherName }), loading && _jsx("div", { children: "Loading messages\u2026" }), _jsx("div", { className: "chat-messages", children: messages.map((msg) => (_jsx("div", { className: msg.sender_auth_id === myId
                        ? "chat-bubble my-message"
                        : "chat-bubble other-message", children: msg.content }, msg.id))) }), _jsxs("div", { className: "chat-input-area", children: [_jsx("input", { value: newMessage, onChange: (e) => setNewMessage(e.target.value), placeholder: "Write a message..." }), _jsx("button", { onClick: sendMessage, children: "Send" })] })] }));
}
