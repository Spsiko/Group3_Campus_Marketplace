import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ListingGrid from "../../components/ListingGrid";
import "../../style/listings.scss";
import { useListings } from "../../lib/UseListing";
import Header from "../../components/Header";
//import Footer from "../../components/Footer";
import { useRecentListings } from "../../lib/UseRecentLisings";
export default function ListingsPage() {
    const { listings, loading, error } = useListings();
    const { recentListings } = useRecentListings();
    const [searchParams, setSearchParams] = useSearchParams();
    const searchQuery = searchParams.get("q") ?? "";
    const categoryParam = searchParams.get("category");
    const categoryFilter = categoryParam ?? "all";
    const minPrice = searchParams.get("minPrice") ?? "";
    const maxPrice = searchParams.get("maxPrice") ?? "";
    const sortOption = searchParams.get("sort") ?? "relevance";
    const viewMode = searchParams.get("view");
    const showRecentOnly = viewMode === "recent";
    function updateParams(updates) {
        const next = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === "") {
                next.delete(key);
            }
            else {
                next.set(key, value);
            }
        });
        setSearchParams(next);
    }
    const handleSearchChange = (e) => {
        updateParams({ q: e.target.value || null });
    };
    const updateCategoryFilter = (value) => {
        updateParams({ category: value === "all" ? null : value });
    };
    const updatePriceRange = (field, value) => {
        updateParams({ [field]: value || null });
    };
    const updateSortOption = (value) => {
        updateParams({ sort: value === "relevance" ? null : value });
    };
    // All categories that actually exist in the DB
    const categories = useMemo(() => Array.from(new Set(listings.map((l) => l.category))).sort(), [listings]);
    // Core filtering + relevance metric
    const filteredAndSorted = useMemo(() => {
        const baseListings = showRecentOnly && recentListings.length > 0 ? recentListings : listings;
        let result = [...baseListings];
        // Text search: title + description
        if (searchQuery.trim() !== "") {
            const q = searchQuery.toLowerCase();
            result = result.filter((listing) => {
                const title = listing.title.toLowerCase();
                const desc = (listing.description ?? "").toLowerCase();
                const titleMatch = title.includes(q);
                const descMatch = desc.includes(q);
                return titleMatch || descMatch;
            });
        }
        // Category filter
        if (categoryFilter !== "all") {
            result = result.filter((listing) => listing.category === categoryFilter);
        }
        // Price range filter
        const min = minPrice ? Number(minPrice) : null;
        const max = maxPrice ? Number(maxPrice) : null;
        if (min !== null && !Number.isNaN(min)) {
            result = result.filter((listing) => listing.price >= min);
        }
        if (max !== null && !Number.isNaN(max)) {
            result = result.filter((listing) => listing.price <= max);
        }
        const now = Date.now();
        // Relevance score: query match + recency
        function relevanceScore(listing) {
            let score = 0;
            if (searchQuery.trim() !== "") {
                const q = searchQuery.toLowerCase();
                const title = listing.title.toLowerCase();
                const desc = (listing.description ?? "").toLowerCase();
                if (title.includes(q))
                    score += 5;
                if (title.startsWith(q))
                    score += 2;
                if (desc.includes(q))
                    score += 2;
            }
            // Recency boost: up to +1 for items ~0–30 days old
            const createdAtMs = listing.createdAt
                ? new Date(listing.createdAt).getTime()
                : 0;
            const ageDays = createdAtMs
                ? (now - createdAtMs) / (1000 * 60 * 60 * 24)
                : Number.POSITIVE_INFINITY;
            const recencyBoost = ageDays === Number.POSITIVE_INFINITY
                ? 0
                : Math.max(0, 30 - ageDays) / 30;
            score += recencyBoost;
            return score;
        }
        // Sorting
        switch (sortOption) {
            case "price-asc":
                result.sort((a, b) => a.price - b.price);
                break;
            case "price-desc":
                result.sort((a, b) => b.price - a.price);
                break;
            case "newest":
                result.sort((a, b) => {
                    const aTime = a.createdAt
                        ? new Date(a.createdAt).getTime()
                        : 0;
                    const bTime = b.createdAt
                        ? new Date(b.createdAt).getTime()
                        : 0;
                    return bTime - aTime;
                });
                break;
            case "relevance":
            default:
                result.sort((a, b) => relevanceScore(b) - relevanceScore(a));
                break;
        }
        return result;
    }, [
        listings,
        recentListings,
        showRecentOnly,
        searchQuery,
        categoryFilter,
        minPrice,
        maxPrice,
        sortOption,
    ]);
    return (_jsxs(_Fragment, { children: [_jsx(Header, {}), _jsxs("div", { className: "listings-page", children: [_jsxs("aside", { className: "listings-page__sidebar", children: [_jsx("h2", { className: "listings-page__sidebar-title", children: "Filters" }), _jsxs("div", { className: "listings-page__filter-group", children: [_jsx("label", { className: "listings-page__filter-label", htmlFor: "search", children: "Search" }), _jsx("input", { id: "search", type: "text", className: "listings-page__search-input", placeholder: "Search listings...", value: searchQuery, onChange: handleSearchChange })] }), _jsxs("div", { className: "listings-page__filter-group", children: [_jsx("span", { className: "listings-page__filter-label", children: "Category" }), _jsxs("div", { className: "listings-page__filter-options", children: [_jsxs("label", { className: "listings-page__radio-option", children: [_jsx("input", { type: "radio", name: "category", value: "all", checked: categoryFilter === "all", onChange: () => updateCategoryFilter("all") }), _jsx("span", { children: "All" })] }), categories.map((category) => (_jsxs("label", { className: "listings-page__radio-option", children: [_jsx("input", { type: "radio", name: "category", value: category, checked: categoryFilter === category, onChange: () => updateCategoryFilter(category) }), _jsx("span", { children: category.charAt(0).toUpperCase() + category.slice(1) })] }, category)))] })] }), _jsxs("div", { className: "listings-page__filter-group", children: [_jsx("span", { className: "listings-page__filter-label", children: "Price range" }), _jsxs("div", { className: "listings-page__price-range", children: [_jsx("input", { type: "number", className: "listings-page__price-input", placeholder: "Min", value: minPrice, onChange: (e) => updatePriceRange("minPrice", e.target.value) }), _jsx("span", { className: "listings-page__price-separator", children: "\u2013" }), _jsx("input", { type: "number", className: "listings-page__price-input", placeholder: "Max", value: maxPrice, onChange: (e) => updatePriceRange("maxPrice", e.target.value) })] })] })] }), _jsxs("main", { className: "listings-page__main", children: [_jsxs("div", { className: "listings-page__header", children: [_jsx("h1", { className: "listings-page__title", children: showRecentOnly ? "All Recently Viewed Items" : "All Listings" }), _jsxs("div", { className: "listings-page__sort", children: [_jsx("label", { className: "listings-page__filter-label", htmlFor: "sort", children: "Sort by" }), _jsxs("select", { id: "sort", className: "listings-page__sort-select", value: sortOption, onChange: (e) => updateSortOption(e.target.value), children: [_jsx("option", { value: "relevance", children: "Relevance" }), _jsx("option", { value: "price-asc", children: "Price: low to high" }), _jsx("option", { value: "price-desc", children: "Price: high to low" }), _jsx("option", { value: "newest", children: "Newest" })] })] })] }), loading && _jsx("p", { className: "listings-page__status", children: "Loading..." }), error && (_jsx("p", { className: "listings-page__status listings-page__status--error", children: error })), !loading && !error && filteredAndSorted.length === 0 && (_jsx("p", { className: "listings-page__status", children: "No listings found." })), !loading && !error && filteredAndSorted.length > 0 && (_jsx(ListingGrid, { listings: filteredAndSorted }))] })] })] }));
}
