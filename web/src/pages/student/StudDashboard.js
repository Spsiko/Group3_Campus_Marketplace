import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import DashboardSection from "../../components/DashboardSection";
import { useListings } from "../../lib/UseListing";
import { useNavigate } from "react-router-dom";
import "../../style/dashboard.scss";
import Header from "../../components/Header";
//import Footer from "../../components/Footer";
import { useRecentListings } from "../../lib/UseRecentLisings";
export default function DashboardPage() {
    const { listings, loading, error } = useListings();
    const { recentListings } = useRecentListings();
    const navigate = useNavigate();
    const recommended = listings.slice(0, 8);
    const categories = Array.from(new Set(listings.map((l) => l.category))).sort();
    function getCategoryTitle(category) {
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
    return (_jsxs(_Fragment, { children: [_jsx(Header, {}), _jsx("div", { className: "dashboard-page", children: _jsxs("main", { className: "dashboard-page__main", children: [loading && (_jsx("p", { className: "dashboard-page__status", children: "Loading listings..." })), error && (_jsx("p", { className: "dashboard-page__status dashboard-page__status--error", children: error })), !loading && !error && (_jsxs(_Fragment, { children: [recentListings.length > 0 && (_jsx(DashboardSection, { title: "Recently viewed", listings: recentListings, onSeeAll: () => navigate("/student/listings?view=recent") })), recommended.length > 0 && (_jsx(DashboardSection, { title: "Recommended for you", listings: recommended, onSeeAll: () => navigate("/student/listings") })), categories.map((category) => {
                                    const categoryListings = listings
                                        .filter((l) => l.category === category)
                                        .slice(0, 4);
                                    if (categoryListings.length === 0)
                                        return null;
                                    return (_jsx(DashboardSection, { title: getCategoryTitle(category), listings: categoryListings, onSeeAll: () => navigate(`/student/listings?category=${encodeURIComponent(category)}`) }, category));
                                })] }))] }) })] }));
}
