import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// web/src/pages/admin/ManageOrders.tsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import "../../style/admin-orders.scss";
function getInitials(name, email) {
    const source = (name && name.trim()) || (email && email.split("@")[0]) || "";
    if (!source)
        return "?";
    const parts = source.split(" ");
    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
function mapStatusLabel(status) {
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
function mapStatusTabFilter(tab, status) {
    const s = (status || "").toLowerCase();
    if (tab === "all")
        return true;
    if (tab === "pending")
        return s === "pending";
    if (tab === "active")
        return s === "paid" || s === "shipped";
    if (tab === "delivered")
        return s === "completed";
    if (tab === "issues")
        return s === "cancelled" || s === "refunded";
    return true;
}
export default function ManageOrders() {
    const [rawOrders, setRawOrders] = useState([]);
    const [displayOrders, setDisplayOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState("all");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [paymentFilter, setPaymentFilter] = useState("all"); // placeholder
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
            const orders = (ordersData || []);
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
            const items = (itemsData || []);
            // 3) Buyers
            const buyerIds = [...new Set(orders.map((o) => o.buyer_id))];
            const { data: buyersData, error: buyersError } = buyerIds.length > 0
                ? await supabase
                    .from("users")
                    .select("id,full_name,email")
                    .in("id", buyerIds)
                : { data: [], error: null };
            if (buyersError) {
                console.error("Buyers error:", buyersError);
                setError(buyersError.message);
                setLoading(false);
                return;
            }
            const buyers = (buyersData || []);
            // 4) Listings (by listing_id from order_item)
            const listingIds = [
                ...new Set(items.map((i) => i.listing_id).filter(Boolean)),
            ];
            const { data: listingsData, error: listingsError } = listingIds.length > 0
                ? await supabase
                    .from("listings")
                    .select("id, title, category, seller_id")
                    .in("id", listingIds)
                : { data: [], error: null };
            if (listingsError) {
                console.error("Listings error:", listingsError);
                setError(listingsError.message);
                setLoading(false);
                return;
            }
            const listings = (listingsData || []);
            // 5) Sellers (collect seller_ids from listings and order_item.seller_id)
            const sellerIdsFromListings = listings
                .map((l) => l.seller_id)
                .filter(Boolean);
            const sellerIdsFromItems = items
                .map((i) => i.seller_id)
                .filter(Boolean);
            const sellerIds = [
                ...new Set([...sellerIdsFromListings, ...sellerIdsFromItems]),
            ];
            // Fetch sellers, trying to match both users.id and users.auth_user_id
            let sellers = [];
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
                    ...(sellersById || []),
                    ...(sellersByAuth || []),
                ];
            }
            // Maps
            const buyersMap = new Map(buyers.map((b) => [b.id, b]));
            // sellersMap keyed by BOTH id and auth_user_id so any seller_id form works
            const sellersMap = new Map();
            sellers.forEach((s) => {
                if (s.id)
                    sellersMap.set(s.id, s);
                if (s.auth_user_id)
                    sellersMap.set(s.auth_user_id, s);
            });
            const listingsMap = new Map(listings.map((l) => [l.id, l]));
            // Group items by order_id
            const itemsByOrder = {};
            items.forEach((it) => {
                if (!itemsByOrder[it.order_id])
                    itemsByOrder[it.order_id] = [];
                itemsByOrder[it.order_id].push(it);
            });
            // Build display rows
            const rows = orders.map((o, idx) => {
                const orderItems = itemsByOrder[o.order_id] || [];
                const totalItems = orderItems.reduce((sum, it) => sum + (it.quantity ?? 1), 0);
                const firstItem = orderItems[0];
                // Try listing for first item
                let primaryListing = null;
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
                }
                else {
                    const distinctSellerIds = [
                        ...new Set(orderItems
                            .map((i) => {
                            const l = listingsMap.get(i.listing_id);
                            // prefer listing.seller_id, fallback to order_item.seller_id
                            return (l && l.seller_id) || i.seller_id || undefined;
                        })
                            .filter(Boolean)),
                    ];
                    if (distinctSellerIds.length > 1) {
                        sellerName = "Multiple sellers";
                        sellerEmail = "";
                    }
                    else {
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
                    itemTitle: fallbackListing?.title ||
                        (orderItems.length > 1
                            ? `${orderItems.length} items`
                            : `Item (${firstItem?.listing_id?.slice(0, 8)}...)`),
                    itemCategory: fallbackListing?.category ||
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
            if (s === "pending")
                counts.pending += 1;
            if (s === "paid" || s === "shipped")
                counts.active += 1;
            if (s === "completed")
                counts.delivered += 1;
            if (s === "cancelled" || s === "refunded")
                counts.issues += 1;
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
                return (r.order_id.toLowerCase().includes(q) ||
                    r.itemTitle.toLowerCase().includes(q) ||
                    r.buyerName.toLowerCase().includes(q) ||
                    r.buyerEmail.toLowerCase().includes(q) ||
                    r.sellerName.toLowerCase().includes(q) ||
                    r.sellerEmail.toLowerCase().includes(q));
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
    const totalRevenue = rawOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    return (_jsxs("div", { className: "admin-orders", children: [_jsx("h1", { className: "page-title", children: "Orders" }), _jsxs("section", { className: "orders-kpi-grid", children: [_jsxs("div", { className: "orders-kpi-card", children: [_jsxs("div", { className: "kpi-top", children: [_jsx("span", { className: "kpi-label", children: "Total Orders" }), _jsx("span", { className: "kpi-icon", children: "\uD83D\uDECD\uFE0F" })] }), _jsx("div", { className: "kpi-value", children: totalOrders.toLocaleString() }), _jsx("div", { className: "kpi-sub", children: "All time orders" })] }), _jsxs("div", { className: "orders-kpi-card", children: [_jsxs("div", { className: "kpi-top", children: [_jsx("span", { className: "kpi-label", children: "Pending Orders" }), _jsx("span", { className: "kpi-icon", children: "\u23F3" })] }), _jsx("div", { className: "kpi-value", children: pendingOrders.toLocaleString() }), _jsx("div", { className: "kpi-sub", children: "Awaiting confirmation" })] }), _jsxs("div", { className: "orders-kpi-card", children: [_jsxs("div", { className: "kpi-top", children: [_jsx("span", { className: "kpi-label", children: "Active Orders" }), _jsx("span", { className: "kpi-icon", children: "\uD83D\uDCE6" })] }), _jsx("div", { className: "kpi-value", children: activeOrders.toLocaleString() }), _jsx("div", { className: "kpi-sub", children: "In progress" })] }), _jsxs("div", { className: "orders-kpi-card", children: [_jsxs("div", { className: "kpi-top", children: [_jsx("span", { className: "kpi-label", children: "Total Revenue" }), _jsx("span", { className: "kpi-icon", children: "$" })] }), _jsx("div", { className: "kpi-value", children: totalRevenue.toLocaleString("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                }) }), _jsx("div", { className: "kpi-sub", children: "All settled payments" })] })] }), _jsxs("section", { className: "orders-panel", children: [_jsx("div", { className: "panel-header", children: _jsxs("div", { children: [_jsx("div", { className: "panel-title", children: "Order Management" }), _jsx("div", { className: "panel-sub", children: "Track and manage all marketplace orders" })] }) }), _jsxs("div", { className: "orders-tab-row", children: [_jsx("button", { className: `tab-pill ${tab === "all" ? "is-active" : ""}`, onClick: () => setTab("all"), children: "All Orders" }), _jsxs("button", { className: `tab-pill ${tab === "pending" ? "is-active" : ""}`, onClick: () => setTab("pending"), children: ["Pending", tabCounts.pending > 0 && (_jsx("span", { className: "pill-count", children: tabCounts.pending }))] }), _jsxs("button", { className: `tab-pill ${tab === "active" ? "is-active" : ""}`, onClick: () => setTab("active"), children: ["Active", tabCounts.active > 0 && (_jsx("span", { className: "pill-count", children: tabCounts.active }))] }), _jsxs("button", { className: `tab-pill ${tab === "delivered" ? "is-active" : ""}`, onClick: () => setTab("delivered"), children: ["Delivered", tabCounts.delivered > 0 && (_jsx("span", { className: "pill-count", children: tabCounts.delivered }))] }), _jsxs("button", { className: `tab-pill ${tab === "issues" ? "is-active" : ""}`, onClick: () => setTab("issues"), children: ["Issues", tabCounts.issues > 0 && (_jsx("span", { className: "pill-count pill-count--danger", children: tabCounts.issues }))] })] }), _jsxs("div", { className: "orders-filter-row", children: [_jsx("div", { className: "search-wrapper", children: _jsx("input", { className: "search-input", type: "text", placeholder: "Search by order number, buyer, seller, or item...", value: search, onChange: (e) => setSearch(e.target.value) }) }), _jsxs("div", { className: "filter-selects", children: [_jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), children: [_jsx("option", { value: "all", children: "All Status" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "paid", children: "Paid" }), _jsx("option", { value: "shipped", children: "In Transit" }), _jsx("option", { value: "completed", children: "Delivered" }), _jsx("option", { value: "cancelled", children: "Cancelled" }), _jsx("option", { value: "refunded", children: "Refunded" })] }), _jsxs("select", { value: paymentFilter, onChange: (e) => setPaymentFilter(e.target.value), children: [_jsx("option", { value: "all", children: "All Payments" }), _jsx("option", { value: "card", disabled: true, children: "Card (placeholder)" }), _jsx("option", { value: "cash", disabled: true, children: "Cash (placeholder)" })] })] })] }), _jsx("div", { className: "orders-table-wrapper", children: loading ? (_jsx("div", { className: "empty-state", children: "Loading orders\u2026" })) : error ? (_jsxs("div", { className: "empty-state error", children: ["Error loading orders: ", error] })) : filteredOrders.length === 0 ? (_jsx("div", { className: "empty-state", children: "No orders found." })) : (_jsxs(_Fragment, { children: [_jsxs("table", { className: "orders-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: "col-order", children: "Order" }), _jsx("th", { className: "col-item", children: "Item" }), _jsx("th", { className: "col-person", children: "Buyer" }), _jsx("th", { className: "col-person", children: "Seller" }), _jsx("th", { className: "col-amount", children: "Amount" }), _jsx("th", { className: "col-status", children: "Status" })] }) }), _jsx("tbody", { children: paginatedOrders.map((o) => (_jsxs("tr", { children: [_jsx("td", { className: "col-order", children: _jsxs("div", { className: "order-cell", children: [_jsx("input", { type: "checkbox", className: "row-checkbox" }), _jsxs("div", { className: "order-id-block", children: [_jsx("div", { className: "order-id-text", children: o.order_id }), _jsxs("div", { className: "order-meta", children: ["ID: ", o.internalId, " \u2022 ", o.totalItems, " item", o.totalItems !== 1 ? "s" : ""] })] })] }) }), _jsxs("td", { className: "col-item", children: [_jsx("div", { className: "item-title", children: o.itemTitle }), o.itemCategory && (_jsx("div", { className: "item-sub", children: o.itemCategory }))] }), _jsx("td", { className: "col-person", children: _jsxs("div", { className: "person-cell", children: [_jsx("div", { className: "avatar", children: getInitials(o.buyerName, o.buyerEmail) }), _jsxs("div", { className: "person-info", children: [_jsx("div", { className: "person-name", children: o.buyerName }), o.buyerEmail && (_jsx("div", { className: "person-email", children: o.buyerEmail }))] })] }) }), _jsx("td", { className: "col-person", children: _jsxs("div", { className: "person-cell", children: [_jsx("div", { className: "avatar avatar--seller", children: getInitials(o.sellerName, o.sellerEmail) }), _jsxs("div", { className: "person-info", children: [_jsx("div", { className: "person-name", children: o.sellerName }), o.sellerEmail && (_jsx("div", { className: "person-email", children: o.sellerEmail }))] })] }) }), _jsx("td", { className: "col-amount", children: o.totalAmount.toLocaleString("en-US", {
                                                            style: "currency",
                                                            currency: "USD",
                                                        }) }), _jsx("td", { className: "col-status", children: _jsx("span", { className: `status-pill status-${o.statusKey}`, children: o.statusLabel }) })] }, o.order_id))) })] }), _jsxs("div", { className: "orders-footer", children: [_jsxs("span", { children: ["Showing ", paginatedOrders.length, " of ", filteredOrders.length, " orders", totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`] }), _jsxs("div", { className: "pager", children: [_jsx("button", { onClick: goToFirstPage, disabled: currentPage === 1, title: "First Page", children: "\u00AB\u00AB" }), _jsx("button", { onClick: goToPreviousPage, disabled: currentPage === 1, title: "Previous Page", children: "Previous" }), _jsxs("span", { className: "page-info", children: ["Page ", currentPage, " of ", totalPages] }), _jsx("button", { onClick: goToNextPage, disabled: currentPage === totalPages || totalPages === 0, title: "Next Page", children: "Next" }), _jsx("button", { onClick: goToLastPage, disabled: currentPage === totalPages || totalPages === 0, title: "Last Page", children: "\u00BB\u00BB" })] })] })] })) })] })] }));
}
