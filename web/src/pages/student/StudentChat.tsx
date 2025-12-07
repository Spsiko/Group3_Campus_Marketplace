// src/pages/student/StudentChat.tsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { getResolvedUserSync } from "../../lib/resolvedUser";
import "../../style/StudentChat.scss";

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

  // NEW: Listing details
  const [listing, setListing] = useState<any>(null);

  // ---------------------------
  // Load product details using listing_id
  // ---------------------------
  async function loadListingDetails(listingId: string) {
    const { data, error } = await supabase
      .from("listings")
      .select("id, title, price, image_urls")
      .eq("id", listingId)
      .single();

    if (!error && data) setListing(data);
  }

  // ---------------------------
  // Load other user's name
  // ---------------------------
  async function loadUserName(otherId: string) {
    const { data } = await supabase
      .from("users")
      .select("full_name, email")
      .eq("auth_user_id", otherId)
      .single();

    setOtherName(data?.full_name || data?.email || "User");
  }

  // ---------------------------
  // Load chat messages
  // ---------------------------
  async function loadMessages(listingId: string, myId: string, otherId: string) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("listing_id", listingId)
      .order("created_at", { ascending: true });

    if (error || !data) {
      setMessages([]);
      return;
    }

    // Filter only messages between these two users
    const filtered = data.filter(
      (m: ChatMessage) =>
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
            ((msg.sender_auth_id === myId && msg.receiver_auth_id === otherId) ||
              (msg.sender_auth_id === otherId &&
                msg.receiver_auth_id === myId));

          if (belongs) setMessages((prev) => [...prev, msg]);
        }
      )
      .subscribe();

    return channel;
  }

  // ---------------------------
  // Initial load
  // ---------------------------
  useEffect(() => {
    if (!listingId || !otherUserId || !myId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    loadListingDetails(listingId);     // NEW
    loadUserName(otherUserId);
    loadMessages(listingId, myId, otherUserId).finally(() => setLoading(false));

    const channel = subscribeToRealtime(myId, listingId, otherUserId);

    return () => {
      supabase.removeChannel(channel);
    };
  }, [listingId, otherUserId, myId]);

  // ---------------------------
  // Send message
  // ---------------------------
  async function sendMessage() {
    if (!listingId || !otherUserId || !myId) return;
    if (!newMessage.trim()) return;

    await supabase.from("messages").insert({
      listing_id: listingId,
      sender_auth_id: myId,
      receiver_auth_id: otherUserId,
      content: newMessage.trim(),
    });

    setNewMessage("");
  }

  // ---------------------------
  // UI
  // ---------------------------
  if (!listingId || !otherUserId)
    return <p className="chat-page">Invalid chat URL.</p>;

  if (!myId) return <p className="chat-page">Please sign in to view messages.</p>;

  return (
    <div className="chat-page">
      <Link to="/student/messages" className="back-button">← Back</Link>

      {/* PRODUCT + USER HEADER */}
      <div className="chat-header">
        {listing && (
          <div className="chat-listing-info">

            <div>
              <h3>{listing.title}</h3>
              <h6>Product ID : {listing.id}</h6>
              <h6>Chat with {otherName}</h6>
            </div>
          </div>
        )}
      </div>

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

      {/* SEND MESSAGE SECTION */}
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
