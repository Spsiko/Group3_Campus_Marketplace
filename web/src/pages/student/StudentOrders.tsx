// src/pages/student/StudentOrders.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { getUser } from "../../lib/auth";
import { useNavigate } from "react-router-dom";
import "../../style/StudentOrders.scss";

type OrderItem = {
  listing_id: string;
  title: string;
  price: number;
  quantity: number;
  seller_id: string;
};

type OrderRow = {
  id: string;
  order_id: string;
  buyer_id: string;
  total_amount: number;
  status: string;
  payment_method: string | null;
  created_at: string;
  items: OrderItem[]; // from jsonb
};

export default function StudentOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const user = getUser();
      if (!user || !user.id) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const mapped = (data as any[]).map((row) => ({
          ...row,
          items: Array.isArray(row.items) ? row.items : [],
        })) as OrderRow[];

        setOrders(mapped);
      }

      setLoading(false);
    }

    load();
  }, [navigate]);

  if (loading) {
    return <div className="orders-page">Loading your orders…</div>;
  }

  if (!orders.length) {
    return (
      <div className="orders-page">
        <h1>My Orders</h1>
        <p className="orders-empty">
          You have not placed any orders yet.
        </p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1>My Orders</h1>

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-card__header">
              <div>
                <div className="order-card__id">
                  Order #{order.order_id || order.id.slice(0, 8)}
                </div>
                <div className="order-card__meta">
                  Placed on{" "}
                  {new Date(order.created_at).toLocaleString()}
                </div>
              </div>
              <div className="order-card__status">
                <span className={`badge badge--${order.status}`}>
                  {order.status}
                </span>
                <div className="order-card__amount">
                  ${Number(order.total_amount || 0).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="order-card__items">
              {order.items.map((item, idx) => (
                <div key={item.listing_id + idx} className="order-item">
                  <div className="order-item__title">{item.title}</div>
                  <div className="order-item__qty">
                    Qty: {item.quantity || 1}
                  </div>
                  <div className="order-item__price">
                    ${Number(item.price || 0).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {order.payment_method && (
              <div className="order-card__footer">
                Payment: {order.payment_method}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
