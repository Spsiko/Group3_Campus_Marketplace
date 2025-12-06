import DashboardSection from "../../components/DashboardSection";
import { useListings } from "../../lib/UseListing";
import type { Listing } from "../../lib/listings";
import { useNavigate } from "react-router-dom";
import "../../style/dashboard.scss";
import Header from "../../components/Header";
//import Footer from "../../components/Footer";
import { useRecentListings } from "../../lib/UseRecentLisings";

export default function DashboardPage() {
  const { listings, loading, error } = useListings();
  const { recentListings } = useRecentListings();
  const navigate = useNavigate();

  const recommended: Listing[] = listings.slice(0, 8);

  const categories = Array.from(
    new Set(listings.map((l) => l.category))
  ).sort();

  function getCategoryTitle(category: string): string {
    switch (category) {
      case "electronics":
        return "Popular Electronics";
      case "books":
        return "Books & Textbooks";
      case "furniture":
        return "Dorm Essentials";
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  }

  return (
    <>
      <Header />
      <div className="dashboard-page">
        <main className="dashboard-page__main">
          {loading && (
            <p className="dashboard-page__status">Loading listings...</p>
          )}
          {error && (
            <p className="dashboard-page__status dashboard-page__status--error">
              {error}
            </p>
          )}

          {!loading && !error && (
            <>
              {recentListings.length > 0 && (
                <DashboardSection
                  title="Recently viewed"
                  listings={recentListings}
                  onSeeAll={() => navigate("/student/listings?view=recent")}
                />
              )}

              {recommended.length > 0 && (
                <DashboardSection
                  title="Recommended for you"
                  listings={recommended}
                  onSeeAll={() => navigate("/student/listings")}
                />
              )}

              {categories.map((category) => {
                const categoryListings = listings
                  .filter((l) => l.category === category)
                  .slice(0, 4);

                if (categoryListings.length === 0) return null;

                return (
                  <DashboardSection
                    key={category}
                    title={getCategoryTitle(category)}
                    listings={categoryListings}
                    onSeeAll={() =>
                      navigate(
                        `/student/listings?category=${encodeURIComponent(category)}`
                      )
                    }
                  />
                );
              })}
            </>
          )}
        </main>
      </div>
    
    </>
  );
}
