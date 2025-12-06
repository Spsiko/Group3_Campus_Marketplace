import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ListingGrid from "../../components/ListingGrid";
import type { Listing } from "../../lib/listings";
import "../../style/listings.scss";
import { useListings } from "../../lib/UseListing";
import Header from "../../components/Header";
//import Footer from "../../components/Footer";
import { useRecentListings } from "../../lib/UseRecentLisings";

type CategoryFilter = "all" | string;
type SortOption = "relevance" | "price-asc" | "price-desc" | "newest";

export default function ListingsPage() {
  const { listings, loading, error } = useListings();
  const { recentListings } = useRecentListings();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("q") ?? "";
  const categoryParam = searchParams.get("category");
  const categoryFilter: CategoryFilter = categoryParam ?? "all";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const sortOption =
    (searchParams.get("sort") as SortOption | null) ?? "relevance";
  const viewMode = searchParams.get("view");
  const showRecentOnly = viewMode === "recent";

  function updateParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });

    setSearchParams(next);
  }

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    updateParams({ q: e.target.value || null });
  };

  const updateCategoryFilter = (value: CategoryFilter) => {
    updateParams({ category: value === "all" ? null : value });
  };

  const updatePriceRange = (field: "minPrice" | "maxPrice", value: string) => {
    updateParams({ [field]: value || null });
  };

  const updateSortOption = (value: SortOption) => {
    updateParams({ sort: value === "relevance" ? null : value });
  };

  // All categories that actually exist in the DB
  const categories = useMemo(
    () => Array.from(new Set(listings.map((l) => l.category))).sort(),
    [listings]
  );

  // Core filtering + relevance metric
  const filteredAndSorted = useMemo(() => {
    const baseListings =
      showRecentOnly && recentListings.length > 0 ? recentListings : listings;

    let result: Listing[] = [...baseListings];

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
    function relevanceScore(listing: Listing): number {
      let score = 0;

      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const title = listing.title.toLowerCase();
        const desc = (listing.description ?? "").toLowerCase();

        if (title.includes(q)) score += 5;
        if (title.startsWith(q)) score += 2;
        if (desc.includes(q)) score += 2;
      }

      // Recency boost: up to +1 for items ~0–30 days old
      const createdAtMs = (listing as any).createdAt
        ? new Date((listing as any).createdAt).getTime()
        : 0;
      const ageDays = createdAtMs
        ? (now - createdAtMs) / (1000 * 60 * 60 * 24)
        : Number.POSITIVE_INFINITY;
      const recencyBoost =
        ageDays === Number.POSITIVE_INFINITY
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
          const aTime = (a as any).createdAt
            ? new Date((a as any).createdAt).getTime()
            : 0;
          const bTime = (b as any).createdAt
            ? new Date((b as any).createdAt).getTime()
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

  return (
    <>
      <Header />
      <div className="listings-page">
        <aside className="listings-page__sidebar">
          <h2 className="listings-page__sidebar-title">Filters</h2>

          <div className="listings-page__filter-group">
            <label className="listings-page__filter-label" htmlFor="search">
              Search
            </label>
            <input
              id="search"
              type="text"
              className="listings-page__search-input"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <div className="listings-page__filter-group">
            <span className="listings-page__filter-label">Category</span>
            <div className="listings-page__filter-options">
              <label className="listings-page__radio-option">
                <input
                  type="radio"
                  name="category"
                  value="all"
                  checked={categoryFilter === "all"}
                  onChange={() => updateCategoryFilter("all")}
                />
                <span>All</span>
              </label>

              {categories.map((category) => (
                <label
                  key={category}
                  className="listings-page__radio-option"
                >
                  <input
                    type="radio"
                    name="category"
                    value={category}
                    checked={categoryFilter === category}
                    onChange={() => updateCategoryFilter(category)}
                  />
                  <span>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="listings-page__filter-group">
            <span className="listings-page__filter-label">Price range</span>
            <div className="listings-page__price-range">
              <input
                type="number"
                className="listings-page__price-input"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => updatePriceRange("minPrice", e.target.value)}
              />
              <span className="listings-page__price-separator">–</span>
              <input
                type="number"
                className="listings-page__price-input"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => updatePriceRange("maxPrice", e.target.value)}
              />
            </div>
          </div>
        </aside>

        <main className="listings-page__main">
          <div className="listings-page__header">
            <h1 className="listings-page__title">
              {showRecentOnly ? "All Recently Viewed Items" : "All Listings"}
            </h1>

            <div className="listings-page__sort">
              <label
                className="listings-page__filter-label"
                htmlFor="sort"
              >
                Sort by
              </label>
              <select
                id="sort"
                className="listings-page__sort-select"
                value={sortOption}
                onChange={(e) =>
                  updateSortOption(e.target.value as SortOption)
                }
              >
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {loading && <p className="listings-page__status">Loading...</p>}
          {error && (
            <p className="listings-page__status listings-page__status--error">
              {error}
            </p>
          )}
          {!loading && !error && filteredAndSorted.length === 0 && (
            <p className="listings-page__status">No listings found.</p>
          )}
          {!loading && !error && filteredAndSorted.length > 0 && (
            <ListingGrid listings={filteredAndSorted} />
          )}
        </main>
      </div>
      
    </>
  );
}
