import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { getUser } from "../../lib/auth";

// -------------------------------
// TYPES
// -------------------------------
type Order = {
  id: string;
  order_id: string;
  buyer_id: string;
  total_amount: number;
  status: string; // paid, completed, etc.
  created_at: string;
  items: {
    id: string;
    title: string;
    price: number;
    quantity: number;
    image: string;
    seller_id: string;
  }[];
};

// Extracted view for seller
type SellerOrderView = {
  order_id: string;
  created_at: string;
  status: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
};

export default function SellerDashboard() {
  const [sellerId, setSellerId] = useState<string | null>(null);

  const [requested, setRequested] = useState<SellerOrderView[]>([]);
  const [paid, setPaid] = useState<SellerOrderView[]>([]);
  const [completed, setCompleted] = useState<SellerOrderView[]>([]);

  // -------------------------------
  // Load seller profile (users.id)
  // -------------------------------
  useEffect(() => {
    const u = getUser();
    if (!u?.id) return;

    // u.id = users.id (correct key)
    setSellerId(u.id);
  }, []);

  // -------------------------------
  // Fetch orders that contain this seller's items
  // -------------------------------
  useEffect(() => {
    if (!sellerId) return;

    async function loadOrders() {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("ORDER FETCH ERROR:", error);
        return;
      }

      const orders = data as Order[];

      // Filter each order → keep only items belonging to this seller
      const sellerRequested: SellerOrderView[] = [];
      const sellerPaid: SellerOrderView[] = [];
      const sellerCompleted: SellerOrderView[] = [];

      for (const order of orders) {
        if (!order.items) continue;

        for (const item of order.items) {
          if (item.seller_id !== sellerId) continue;

          const view: SellerOrderView = {
            order_id: order.order_id,
            status: order.status,
            created_at: order.created_at,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          };

          if (order.status === "requested") {
            sellerRequested.push(view);
          } else if (order.status === "paid") {
            sellerPaid.push(view);
          } else if (order.status === "completed") {
            sellerCompleted.push(view);
          }
        }
      }

      setRequested(sellerRequested);
      setPaid(sellerPaid);
      setCompleted(sellerCompleted);
    }

    loadOrders();

    // -------------------------------
    // Realtime updates for sellers
    // -------------------------------
    const channel = supabase
      .channel("seller-dashboard-updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        () => loadOrders()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        () => loadOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sellerId]);

  // -------------------------------
  // RENDER LIST UI
  // -------------------------------
  function renderList(title: string, items: SellerOrderView[]) {
    return (
      <section style={{ marginTop: "30px" }}>
        <h2>{title}</h2>

        {items.length === 0 && <p>No items found.</p>}

        {items.map((i, idx) => (
          <div
            key={idx}
            className="order-card"
            style={{
              padding: "12px",
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: "8px",
              marginBottom: "10px",
              display: "flex",
              gap: "16px",
              alignItems: "center",
            }}
          >
            <img
              src={i.image}
              alt={i.title}
              style={{ width: "90px", borderRadius: "8px" }}
            />

            <div>
              <strong>{i.title}</strong>
              <p>${i.price} × {i.quantity}</p>
              <small>Order: {i.order_id}</small>
              <br />
              <small>Date: {new Date(i.created_at).toLocaleString()}</small>
            </div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Seller Dashboard</h1>
      <p>View orders that include your listed products.</p>

      {renderList("Requested Orders", requested)}
      {renderList("Paid Orders", paid)}
      {renderList("Completed / Sold Orders", completed)}
    </div>
  );
}
