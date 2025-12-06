// src/pages/student/StudentChat.tsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { getResolvedUserSync } from "../../lib/resolvedUser";
import "../../style/StudentChat.scss";

// Shape of a row in `messages`
type ChatMessage = {
  id: string;
  listing_id: string;
  sender_auth_id: string;
  receiver_auth_id: string;
  content: string;
  created_at: string;
};

type RouteParams = {
  listingId?: string;
  otherUserId?: string;
};

export default function StudentChat() {
  const { listingId, otherUserId } = useParams<RouteParams>();

  const current = getResolvedUserSync();
  const myId = current?.auth_user_id || "";

  const [otherName, setOtherName] = useState<string>("User");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // ---------------------------
  // Load other user's name
  // ---------------------------
  async function loadUserName(otherId: string) {
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
  async function loadMessages(
    listingId: string,
    myId: string,
    otherId: string
  ) {
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

    const all = data as ChatMessage[];

    // Keep only messages between (myId, otherId) for this listing
    const filtered = all.filter(
      (m) =>
        (m.sender_auth_id === myId && m.receiver_auth_id === otherId) ||
        (m.sender_auth_id === otherId && m.receiver_auth_id === myId)
    );

    setMessages(filtered);
  }

  // ---------------------------
  // Realtime subscription
  // ---------------------------
  function subscribeToRealtime(myId: string, listingId: string, otherId: string) {
    const channel = supabase
      .channel(`chat-${listingId}-${otherId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as ChatMessage;

          const belongs =
            msg.listing_id === listingId &&
            ((msg.sender_auth_id === myId &&
              msg.receiver_auth_id === otherId) ||
              (msg.sender_auth_id === otherId &&
                msg.receiver_auth_id === myId));

          if (belongs) {
            setMessages((prev) => [...prev, msg]);
          }
        }
      )
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
    loadMessages(listingId, myId, otherUserId).finally(() =>
      setLoading(false)
    );

    const channel = subscribeToRealtime(myId, listingId, otherUserId);

    return () => {
      supabase.removeChannel(channel);
    };
  }, [listingId, otherUserId, myId]);

  // ---------------------------
  // Send a message
  // ---------------------------
  async function sendMessage() {
    if (!listingId || !otherUserId || !myId) return;
    if (!newMessage.trim()) return;

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
    return (
      <div className="chat-page">
        <p>Invalid chat URL.</p>
      </div>
    );
  }

  if (!myId) {
    return (
      <div className="chat-page">
        <p>Please sign in to view messages.</p>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <Link to="/student/messages" className="back-button">
        ← Back
      </Link>

      <h2 className="chat-header">{otherName}</h2>

      {loading && <div>Loading messages…</div>}

      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={
              msg.sender_auth_id === myId
                ? "chat-bubble my-message"
                : "chat-bubble other-message"
            }
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="chat-input-area">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Write a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
