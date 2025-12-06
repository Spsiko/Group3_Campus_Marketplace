// src/pages/student/SellerOrders.tsx

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { getResolvedUser } from "../../lib/resolvedUser";
import "../../style/SellerOrders.scss";

export default function SellerOrders() {
  const [authUser, setAuthUser] = useState<any>(null);
  const [sellerOrders, setSellerOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const user = await getResolvedUser();
      setAuthUser(user || null);
    }
    load();
  }, []);

  useEffect(() => {
    if (!authUser?.auth_user_id) return;

    async function fetchSellerOrders() {
      setLoading(true);

      // First join: order_item + listings + orders
      const { data, error } = await supabase
        .from("order_item")
        .select(`
          id,
          quantity,
          price,
          total_amount,
          created_at,
          listing:listing_id (
            id,
            title,
            status,
            image_urls
          ),
          order:order_id (
            order_id,
            buyer_id,
            status,
            created_at
          )
        `)
        .eq("seller_id", authUser.auth_user_id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Seller Orders Load Error:", error);
        setSellerOrders([]);
        setLoading(false);
        return;
      }

      // Fetch buyer names in parallel
      const formatted = await Promise.all(
        (data || []).map(async (row: any) => {
          let buyer = null;

          if (row.order?.buyer_id) {
            const { data: buyerRow } = await supabase
              .from("users")
              .select("full_name, email")
              .eq("id", row.order.buyer_id)
              .maybeSingle();

            buyer = buyerRow || null;
          }

          return {
            orderId: row.order?.order_id,
            orderStatus: row.order?.status,
            orderDate: row.order?.created_at,

            buyerName: buyer?.full_name ?? "Unknown",
            buyerEmail: buyer?.email ?? "Unknown",

            title: row.listing?.title,
            productStatus: row.listing?.status,
            image: row.listing?.image_urls?.[0] ?? "/placeholder.jpg",

            quantity: row.quantity,
            price: row.price,
            total: row.total_amount,
          };
        })
      );

      setSellerOrders(formatted);
      setLoading(false);
    }

    fetchSellerOrders();
  }, [authUser]);

  // ---------------- UI ----------------

  return (
    <div className="seller-orders-page">
      <h2>Orders Received</h2>

      {loading ? (
        <p>Loading...</p>
      ) : sellerOrders.length === 0 ? (
        <p>No sold items yet.</p>
      ) : (
        <div className="orders-list">
          {sellerOrders.map((item, i) => (
            <div key={i} className="order-card">
              <div className="order-header">
                <h3>{item.title}</h3>
                <span className="status-badge">{item.productStatus}</span>
              </div>

              <div className="order-meta">
                <p>
                  <strong>Order #:</strong> {item.orderId}
                </p>
                <p>
                  <strong>Buyer:</strong> {item.buyerName} ({item.buyerEmail})
                </p>
                <p>
                  <strong>Status:</strong> {item.orderStatus}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(item.orderDate).toLocaleString()}
                </p>
              </div>

              <div className="order-items">
                <strong>Sold Item</strong>
                <p>Qty: {item.quantity}</p>
                <p>Price: ${Number(item.price).toFixed(2)}</p>
              </div>

              <div className="order-total">
                <strong>Total Earned:</strong> ${Number(item.total).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
