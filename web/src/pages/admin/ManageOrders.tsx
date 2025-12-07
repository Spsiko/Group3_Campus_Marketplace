// web/src/pages/admin/ManageOrders.tsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import "../../style/admin-orders.scss";

type RawOrder = {
  id: string | null;
  order_id: string;
  buyer_id: string;
  total_amount: number;
  status: string | null;
  created_at: string;
};

type RawOrderItem = {
  order_id: string;
  listing_id: string;
  seller_id: string | null;
  quantity: number | null;
  price: number;
  total_amount: number;
};

type UserRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  auth_user_id?: string | null;
};

type ListingRow = {
  id: string;
  title: string | null;
  category: string | null;
  seller_id: string | null;
};

type StatusTab = "all" | "pending" | "active" | "delivered" | "issues";

type DisplayOrder = {
  order_id: string;
  internalId: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  sellerName: string;
  sellerEmail: string;
  itemTitle: string;
  itemCategory: string;
  totalItems: number;
  totalAmount: number;
  statusKey: string; // lower-case
  statusLabel: string;
  createdAt: string;
};

function getInitials(name?: string | null, email?: string | null) {
  const source = (name && name.trim()) || (email && email.split("@")[0]) || "";
  if (!source) return "?";
  const parts = source.split(" ");
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function mapStatusLabel(status: string) {
  const s = status.toLowerCase();
  switch (s) {
    case "pending":
      return "Pending";
    case "paid":
      return "Paid";
    case "shipped":
      return "In Transit";
    case "completed":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    case "refunded":
      return "Refunded";
    default:
      return status || "Unknown";
  }
}

function mapStatusTabFilter(tab: StatusTab, status: string | null) {
  const s = (status || "").toLowerCase();
  if (tab === "all") return true;

  if (tab === "pending") return s === "pending";
  if (tab === "active") return s === "paid" || s === "shipped";
  if (tab === "delivered") return s === "completed";
  if (tab === "issues") return s === "cancelled" || s === "refunded";

  return true;
}

export default function ManageOrders() {
  const [rawOrders, setRawOrders] = useState<RawOrder[]>([]);
  const [displayOrders, setDisplayOrders] = useState<DisplayOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tab, setTab] = useState<StatusTab>("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all"); // placeholder

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      // 1) Orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("id,order_id,buyer_id,total_amount,status,created_at")
        .order("created_at", { ascending: false });

      if (ordersError) {
        console.error(ordersError);
        setError(ordersError.message);
        setLoading(false);
        return;
      }

      const orders = (ordersData || []) as RawOrder[];
      setRawOrders(orders);

      if (!orders.length) {
        setDisplayOrders([]);
        setLoading(false);
        return;
      }

      // 2) Order items (no join)
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_item")
        .select("order_id, listing_id, seller_id, quantity, price, total_amount");

      if (itemsError) {
        console.error("Order items error:", itemsError);
        setError(itemsError.message);
        setLoading(false);
        return;
      }

      const items = (itemsData || []) as RawOrderItem[];

      // 3) Buyers
      const buyerIds = [...new Set(orders.map((o) => o.buyer_id))];
      const { data: buyersData, error: buyersError } =
        buyerIds.length > 0
          ? await supabase
              .from("users")
              .select("id,full_name,email")
              .in("id", buyerIds)
          : { data: [] as UserRow[], error: null };

      if (buyersError) {
        console.error("Buyers error:", buyersError);
        setError(buyersError.message);
        setLoading(false);
        return;
      }

      const buyers = (buyersData || []) as UserRow[];

      // 4) Listings (by listing_id from order_item)
      const listingIds = [
        ...new Set(items.map((i) => i.listing_id).filter(Boolean)),
      ];

      const { data: listingsData, error: listingsError } =
        listingIds.length > 0
          ? await supabase
              .from("listings")
              .select("id, title, category, seller_id")
              .in("id", listingIds)
          : { data: [] as ListingRow[], error: null };

      if (listingsError) {
        console.error("Listings error:", listingsError);
        setError(listingsError.message);
        setLoading(false);
        return;
      }

      const listings = (listingsData || []) as ListingRow[];

      // 5) Sellers (collect seller_ids from listings and order_item.seller_id)
      const sellerIdsFromListings = listings
        .map((l) => l.seller_id)
        .filter(Boolean) as string[];

      const sellerIdsFromItems = items
        .map((i) => i.seller_id)
        .filter(Boolean) as string[];

      const sellerIds = [
        ...new Set([...sellerIdsFromListings, ...sellerIdsFromItems]),
      ];

      // Fetch sellers, trying to match both users.id and users.auth_user_id
      let sellers: UserRow[] = [];
      if (sellerIds.length > 0) {
        const { data: sellersById, error: sellersByIdError } = await supabase
          .from("users")
          .select("id, full_name, email, auth_user_id")
          .in("id", sellerIds);

        if (sellersByIdError) {
          console.error("Sellers (by id) error:", sellersByIdError);
          setError(sellersByIdError.message);
          setLoading(false);
          return;
        }

        const { data: sellersByAuth, error: sellersByAuthError } = await supabase
          .from("users")
          .select("id, full_name, email, auth_user_id")
          .in("auth_user_id", sellerIds);

        if (sellersByAuthError) {
          console.error("Sellers (by auth_user_id) error:", sellersByAuthError);
          setError(sellersByAuthError.message);
          setLoading(false);
          return;
        }

        sellers = [
          ...((sellersById || []) as UserRow[]),
          ...((sellersByAuth || []) as UserRow[]),
        ];
      }

      // Maps
      const buyersMap = new Map<string, UserRow>(
        buyers.map((b) => [b.id, b])
      );

      // sellersMap keyed by BOTH id and auth_user_id so any seller_id form works
      const sellersMap = new Map<string, UserRow>();
      sellers.forEach((s: any) => {
        if (s.id) sellersMap.set(s.id, s);
        if (s.auth_user_id) sellersMap.set(s.auth_user_id, s);
      });

      const listingsMap = new Map<string, ListingRow>(
        listings.map((l) => [l.id, l])
      );

      // Group items by order_id
      const itemsByOrder: Record<string, RawOrderItem[]> = {};
      items.forEach((it) => {
        if (!itemsByOrder[it.order_id]) itemsByOrder[it.order_id] = [];
        itemsByOrder[it.order_id].push(it);
      });

      // Build display rows
      const rows: DisplayOrder[] = orders.map((o, idx) => {
        const orderItems = itemsByOrder[o.order_id] || [];
        const totalItems = orderItems.reduce(
          (sum, it) => sum + (it.quantity ?? 1),
          0
        );

        const firstItem = orderItems[0];
        // Try listing for first item
        let primaryListing: ListingRow | null = null;
        if (firstItem) {
          primaryListing = listingsMap.get(firstItem.listing_id) || null;
        }

        // Fallback: any listing for this order
        let fallbackListing = primaryListing;
        if (!fallbackListing) {
          for (const item of orderItems) {
            const l = listingsMap.get(item.listing_id);
            if (l) {
              fallbackListing = l;
              break;
            }
          }
        }

        const buyer = buyersMap.get(o.buyer_id);

        // Resolve seller(s)
        let sellerName = "";
        let sellerEmail = "";

        if (orderItems.length === 0) {
          sellerName = "—";
          sellerEmail = "";
        } else {
          const distinctSellerIds = [
            ...new Set(
              orderItems
                .map((i) => {
                  const l = listingsMap.get(i.listing_id);
                  // prefer listing.seller_id, fallback to order_item.seller_id
                  return (l && l.seller_id) || i.seller_id || undefined;
                })
                .filter(Boolean) as string[]
            ),
          ];

          if (distinctSellerIds.length > 1) {
            sellerName = "Multiple sellers";
            sellerEmail = "";
          } else {
            const sellerId = distinctSellerIds[0];
            const s = sellerId ? sellersMap.get(sellerId) : null;
            sellerName = s?.full_name || s?.email || "Seller";
            sellerEmail = s?.email || "";
          }
        }

        const statusKey = (o.status || "unknown").toLowerCase();
        const statusLabel = mapStatusLabel(o.status || "Unknown");

        return {
          order_id: o.order_id,
          internalId: String(idx + 1),
          buyerId: o.buyer_id,
          buyerName: buyer?.full_name || buyer?.email || "Buyer",
          buyerEmail: buyer?.email || "",
          sellerName,
          sellerEmail,
          itemTitle:
            fallbackListing?.title ||
            (orderItems.length > 1
              ? `${orderItems.length} items`
              : `Item (${firstItem?.listing_id?.slice(0, 8)}...)`),
          itemCategory:
            fallbackListing?.category ||
            (orderItems.length > 1 ? "Multiple categories" : "Unknown"),
          totalItems,
          totalAmount: o.total_amount || 0,
          statusKey,
          statusLabel,
          createdAt: o.created_at,
        };
      });

      setDisplayOrders(rows);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  const tabCounts = useMemo(() => {
    const counts = {
      pending: 0,
      active: 0,
      delivered: 0,
      issues: 0,
    };
    rawOrders.forEach((o) => {
      const s = (o.status || "").toLowerCase();
      if (s === "pending") counts.pending += 1;
      if (s === "paid" || s === "shipped") counts.active += 1;
      if (s === "completed") counts.delivered += 1;
      if (s === "cancelled" || s === "refunded") counts.issues += 1;
    });
    return counts;
  }, [rawOrders]);

  const filteredOrders = useMemo(() => {
    let rows = [...displayOrders];

    // Tab filter
    rows = rows.filter((r) => mapStatusTabFilter(tab, r.statusKey));

    // Dropdown status filter (simple: exact status)
    if (statusFilter !== "all") {
      const sf = statusFilter.toLowerCase();
      rows = rows.filter((r) => r.statusKey === sf);
    }

    // Payment filter is currently a no-op; you can extend later

    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((r) => {
        return (
          r.order_id.toLowerCase().includes(q) ||
          r.itemTitle.toLowerCase().includes(q) ||
          r.buyerName.toLowerCase().includes(q) ||
          r.buyerEmail.toLowerCase().includes(q) ||
          r.sellerName.toLowerCase().includes(q) ||
          r.sellerEmail.toLowerCase().includes(q)
        );
      });
    }

    return rows;
  }, [displayOrders, tab, search, statusFilter, paymentFilter]);

  // Pagination logic
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // Pagination functions
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  const goToLastPage = () => {
    setCurrentPage(totalPages);
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [tab, search, statusFilter, paymentFilter]);

  const totalOrders = rawOrders.length;
  const pendingOrders = tabCounts.pending;
  const activeOrders = tabCounts.active;
  const totalRevenue = rawOrders.reduce(
    (sum, o) => sum + (o.total_amount || 0),
    0
  );

  return (
    <div className="admin-orders">
      <h1 className="page-title">Orders</h1>

      {/* KPI cards */}
      <section className="orders-kpi-grid">
        <div className="orders-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Orders</span>
            <span className="kpi-icon">🛍️</span>
          </div>
          <div className="kpi-value">{totalOrders.toLocaleString()}</div>
          <div className="kpi-sub">All time orders</div>
        </div>

        <div className="orders-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Pending Orders</span>
            <span className="kpi-icon">⏳</span>
          </div>
          <div className="kpi-value">{pendingOrders.toLocaleString()}</div>
          <div className="kpi-sub">Awaiting confirmation</div>
        </div>

        <div className="orders-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Active Orders</span>
            <span className="kpi-icon">📦</span>
          </div>
          <div className="kpi-value">{activeOrders.toLocaleString()}</div>
          <div className="kpi-sub">In progress</div>
        </div>

        <div className="orders-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Revenue</span>
            <span className="kpi-icon">$</span>
          </div>
          <div className="kpi-value">
            {totalRevenue.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </div>
          <div className="kpi-sub">All settled payments</div>
        </div>
      </section>

      {/* Main orders panel */}
      <section className="orders-panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">Order Management</div>
            <div className="panel-sub">
              Track and manage all marketplace orders
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="orders-tab-row">
          <button
            className={`tab-pill ${tab === "all" ? "is-active" : ""}`}
            onClick={() => setTab("all")}
          >
            All Orders
          </button>
          <button
            className={`tab-pill ${tab === "pending" ? "is-active" : ""}`}
            onClick={() => setTab("pending")}
          >
            Pending
            {tabCounts.pending > 0 && (
              <span className="pill-count">{tabCounts.pending}</span>
            )}
          </button>
          <button
            className={`tab-pill ${tab === "active" ? "is-active" : ""}`}
            onClick={() => setTab("active")}
          >
            Active
            {tabCounts.active > 0 && (
              <span className="pill-count">{tabCounts.active}</span>
            )}
          </button>
          <button
            className={`tab-pill ${tab === "delivered" ? "is-active" : ""}`}
            onClick={() => setTab("delivered")}
          >
            Delivered
            {tabCounts.delivered > 0 && (
              <span className="pill-count">{tabCounts.delivered}</span>
            )}
          </button>
          <button
            className={`tab-pill ${tab === "issues" ? "is-active" : ""}`}
            onClick={() => setTab("issues")}
          >
            Issues
            {tabCounts.issues > 0 && (
              <span className="pill-count pill-count--danger">
                {tabCounts.issues}
              </span>
            )}
          </button>
        </div>

        {/* Filters: search + dropdowns */}
        <div className="orders-filter-row">
          <div className="search-wrapper">
            <input
              className="search-input"
              type="text"
              placeholder="Search by order number, buyer, seller, or item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-selects">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="shipped">In Transit</option>
              <option value="completed">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="all">All Payments</option>
              <option value="card" disabled>
                Card (placeholder)
              </option>
              <option value="cash" disabled>
                Cash (placeholder)
              </option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="orders-table-wrapper">
          {loading ? (
            <div className="empty-state">Loading orders…</div>
          ) : error ? (
            <div className="empty-state error">
              Error loading orders: {error}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="empty-state">No orders found.</div>
          ) : (
            <>
              <table className="orders-table">
                <thead>
                  <tr>
                    <th className="col-order">Order</th>
                    <th className="col-item">Item</th>
                    <th className="col-person">Buyer</th>
                    <th className="col-person">Seller</th>
                    <th className="col-amount">Amount</th>
                    <th className="col-status">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((o) => (
                    <tr key={o.order_id}>
                      <td className="col-order">
                        <div className="order-cell">
                          <input type="checkbox" className="row-checkbox" />
                          <div className="order-id-block">
                            <div className="order-id-text">{o.order_id}</div>
                            <div className="order-meta">
                              ID: {o.internalId} • {o.totalItems} item
                              {o.totalItems !== 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="col-item">
                        <div className="item-title">{o.itemTitle}</div>
                        {o.itemCategory && (
                          <div className="item-sub">{o.itemCategory}</div>
                        )}
                      </td>

                      <td className="col-person">
                        <div className="person-cell">
                          <div className="avatar">
                            {getInitials(o.buyerName, o.buyerEmail)}
                          </div>
                          <div className="person-info">
                            <div className="person-name">{o.buyerName}</div>
                            {o.buyerEmail && (
                              <div className="person-email">{o.buyerEmail}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="col-person">
                        <div className="person-cell">
                          <div className="avatar avatar--seller">
                            {getInitials(o.sellerName, o.sellerEmail)}
                          </div>
                          <div className="person-info">
                            <div className="person-name">{o.sellerName}</div>
                            {o.sellerEmail && (
                              <div className="person-email">
                                {o.sellerEmail}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="col-amount">
                        {o.totalAmount.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </td>

                      <td className="col-status">
                        <span className={`status-pill status-${o.statusKey}`}>
                          {o.statusLabel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="orders-footer">
                <span>
                  Showing {paginatedOrders.length} of {filteredOrders.length} orders
                  {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
                </span>
                <div className="pager">
                  <button
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                    title="First Page"
                  >
                    ««
                  </button>
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    title="Previous Page"
                  >
                    Previous
                  </button>
                  <span className="page-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages || totalPages === 0}
                    title="Next Page"
                  >
                    Next
                  </button>
                  <button
                    onClick={goToLastPage}
                    disabled={currentPage === totalPages || totalPages === 0}
                    title="Last Page"
                  >
                    »»
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
