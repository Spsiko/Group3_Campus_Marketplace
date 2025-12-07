import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import "../../style/admindashboard.scss";

type NotificationStatus = "active" | "warning" | "error";

type Notification = {
  id: string;
  user_name: string;
  action: string;
  status: NotificationStatus;
  created_at: string;
};

export default function AdminDashboard() {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalPosts, setTotalPosts] = useState<number | null>(null);
  const [engagementRate, setEngagementRate] = useState<number | null>(null);
  const [revenue, setRevenue] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);


  useEffect(() => {
    const loadDashboard = async () => {
      // ---------- TOTAL USERS ----------
      let totalUsersCount = 0;
      const {
        count: usersCount,
        error: usersError,
      } = await supabase
        .from("users") // change if your users table is named differently
        .select("*", { head: true, count: "exact" });

      if (!usersError) {
        totalUsersCount = usersCount ?? 0;
        setTotalUsers(totalUsersCount);
      } else {
        console.error("Error loading users:", usersError);
      }

      // ---------- TOTAL POSTS (LISTINGS) ----------
      const {
        count: postsCount,
        error: postsError,
      } = await supabase
        .from("listings") // change to your listings table name if needed
        .select("*", { head: true, count: "exact" });

      if (!postsError) {
        setTotalPosts(postsCount ?? 0);
      } else {
        console.error("Error loading posts:", postsError);
      }

      // ---------- ENGAGEMENT RATE ----------
      // % of users who created at least 1 listing in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const {
        data: recentListings,
        error: recentListingsError,
      } = await supabase
        .from("listings")
        .select("seller_id, created_at")
        .gte("created_at", thirtyDaysAgo.toISOString());

      if (!recentListingsError && recentListings && totalUsersCount > 0) {
        const activeUserIds = new Set(
          recentListings
            .map((row: any) => row.seller_id)
            .filter((id: string | null) => id !== null)
        );
        const activeUsersCount = activeUserIds.size;

        const rate =
          totalUsersCount > 0
            ? (activeUsersCount / totalUsersCount) * 100
            : 0;

        setEngagementRate(rate);
      } else if (recentListingsError) {
        console.error("Error loading engagement data:", recentListingsError);
        setEngagementRate(0);
      }

      // ---------- REVENUE ----------
      // Sum of price for all listings with status = 'sold'
      const {
        data: soldListings,
        error: revenueError,
      } = await supabase
        .from("listings")
        .select("price, status")
        .eq("status", "sold");

      if (!revenueError && soldListings) {
        const totalRevenue = soldListings.reduce(
          (sum: number, row: any) => sum + (row.price ?? 0),
          0
        );
        setRevenue(totalRevenue);
      } else if (revenueError) {
        console.error("Error loading revenue data:", revenueError);
        setRevenue(0);
      }

      // ---------- RECENT ACTIVITY / NOTIFICATIONS ----------
      const { data: notifData, error: notifError } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (!notifError && notifData) {
        setNotifications(
          notifData.map((n: any) => ({
            id: n.id,
            user_name: n.user_name || 'Unknown User',
            action: n.action || 'Unknown Action',
            status: n.status as NotificationStatus || 'active',
            created_at: n.created_at,
          }))
        );
      } else if (notifError) {
        console.error("Error loading notifications:", notifError);
      }
    };

    loadDashboard();
  }, []);

  const statusToBadgeClass: Record<NotificationStatus, string> = {
    active: "ok",
    warning: "warn",
    error: "danger",
  };

  return (
    <section className="dash">
      <div className="dash-header">
        <h1>Dashboard</h1>
      </div>

      <div className="kpi-grid">
        <div className="kpi card">
          <div className="kpi-title">Total Users</div>
          <div className="kpi-value">
            {totalUsers !== null ? totalUsers.toLocaleString() : "…"}
          </div>
          {/* still static text; can be made dynamic later if you want */}
          <div className="kpi-delta up">Currently registered users</div>
        </div>

        <div className="kpi card">
          <div className="kpi-title">Total Posts</div>
          <div className="kpi-value">
            {totalPosts !== null ? totalPosts.toLocaleString() : "…"}
          </div>
          <div className="kpi-delta up">All posts created so far</div>
        </div>

        <div className="kpi card">
          <div className="kpi-title">Engagement Rate</div>
          <div className="kpi-value">
            {engagementRate !== null
              ? `${engagementRate.toFixed(1)}%`
              : "…"}
          </div>
          <div className="kpi-delta up">Active users in the last 30 days</div>
        </div>

        <div className="kpi card">
          <div className="kpi-title">Revenue</div>
          <div className="kpi-value">
            {revenue !== null
              ? `$${revenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "…"}
          </div>
          <div className="kpi-delta up">Total value of sold items</div>
        </div>
      </div>

      <div className="card activity" style={{
        maxHeight: '600px',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        <div className="activity-title">Recent Activity</div>

        {notifications.map((n) => (
          <div className="row" key={n.id}>
            <div>
              <b>{n.user_name}</b> {n.action}
              <div className="time">
                {new Date(n.created_at).toLocaleString()}
              </div>
            </div>
            <span className={`badge ${statusToBadgeClass[n.status]}`}>
              {n.status}
            </span>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="row">
            <div>No recent activity yet.</div>
          </div>
        )}
      </div>
    </section>
  );
}
