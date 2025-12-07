// src/pages/student/StudentMessages.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { getResolvedUserSync } from "../../lib/resolvedUser";
import "../../style/studentmessages.scss";

type ChatMessage = {
  id: string;
  listing_id: string;
  sender_auth_id: string;
  receiver_auth_id: string;
  content: string;
  created_at: string;
};

type ConversationItem = {
  listing_id: string;
  listing_title: string;
  otherId: string;
  otherName: string;
  lastMessage: string;
  created_at: string;
};

export default function StudentMessages() {
  const current = getResolvedUserSync();
  const myId = current?.auth_user_id || "";

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (myId) loadConversations(myId);
  }, [myId]);

  async function loadConversations(userId: string) {
    setLoaded(false);

    // 1) Fetch messages where I am sender or receiver
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

    const msgs = data as ChatMessage[];

    // 2) Keep only latest message per thread (listing + otherUser)
    const latestByKey: Record<string, ChatMessage> = {};

    for (const msg of msgs) {
      const otherId =
        msg.sender_auth_id === userId
          ? msg.receiver_auth_id
          : msg.sender_auth_id;

      const key = `${msg.listing_id}::${otherId}`;

      if (!latestByKey[key]) latestByKey[key] = msg;
    }

    const keys = Object.keys(latestByKey);
    if (keys.length === 0) {
      setConversations([]);
      setLoaded(true);
      return;
    }

    // Collect all needed IDs
    const listingIds = [...new Set(keys.map(k => k.split("::")[0]))];
    const otherUserIds = [...new Set(keys.map(k => k.split("::")[1]))];

    // 3) Fetch listing titles
    const { data: listingRows, error: listingErr } = await supabase
      .from("listings")
      .select("id, title")
      .in("id", listingIds);

    if (listingErr) {
      console.error("Listing lookup error:", listingErr);
    }

    const listingMap: Record<string, string> = {};
    (listingRows || []).forEach((l) => {
      listingMap[l.id] = l.title || "Item";
    });

    // 4) Fetch user names for conversation partners
    const { data: userRows, error: usersErr } = await supabase
      .from("users")
      .select("auth_user_id, full_name, email")
      .in("auth_user_id", otherUserIds);

    if (usersErr) {
      console.error("Users lookup error:", usersErr);
    }

    const nameMap: Record<string, string> = {};
    (userRows || []).forEach((u) => {
      nameMap[u.auth_user_id] = u.full_name || u.email || "User";
    });

    // 5) Build conversation list
    const convs: ConversationItem[] = keys.map((key) => {
      const [listing_id, otherId] = key.split("::");
      const lastMsg = latestByKey[key];

      return {
        listing_id,
        listing_title: listingMap[listing_id] || "Listing",
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
    return (
      <div className="messages-page">
        <h1>Messages</h1>
        <p>Please sign in to view your messages.</p>
      </div>
    );
  }

  if (!loaded) return <div className="messages-page">Loading messages…</div>;

  return (
    <div className="messages-page">
      <h1>Messages</h1>

      <div className="messages-list">
        {conversations.length === 0 && <p>No conversations yet.</p>}

        {conversations.map((c) => (
          <Link
            key={`${c.listing_id}-${c.otherId}`}
            to={`/student/messages/${c.listing_id}/${c.otherId}`}
            className="msg-row"
          >
            <div className="msg-title">
              <strong>{c.listing_title}</strong>
            </div>

            <div className="msg-top">
              <span className="msg-name">{c.otherName}</span>
              <small className="msg-time">
                {new Date(c.created_at).toLocaleString()}
              </small>
            </div>

            <div className="msg-last">{c.lastMessage}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
