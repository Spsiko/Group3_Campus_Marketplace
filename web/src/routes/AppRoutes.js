import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navigate, Routes, Route } from "react-router-dom";
import { CartProvider } from "../context/CartContext";
// public
import LandingPage from "../pages/LandingPage";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
// admin
import AdminLayout from "../layout/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageUsers from "../pages/admin/ManageUsers";
import ManageListings from "../pages/admin/ManageListings";
import ManageOrders from "../pages/admin/ManageOrders";
import Analytics from "../pages/admin/Analytics";
import Settings from "../pages/admin/Settings";
import AdminProfile from "../pages/admin/AdminProfile";
import ReportsPage from "../pages/admin/Reports";
// student
import StudentLayout from "../layout/StudentLayout";
import StudDashboard from "../pages/student/StudDashboard";
import Sell from "../pages/student/StudentSell";
import Messages from "../pages/student/StudentMessages";
import Listings from "../pages/student/Listings";
import Profile from "../pages/student/StudentProfile";
import StudentProduct from "../pages/student/StudentProduct";
import Cart from "../pages/student/StudentCart";
import StudentCheckout from "../pages/student/StudentCheckout";
import CheckoutSuccess from "../pages/student/CheckoutSuccess";
import Orders from "../pages/student/StudentOrders";
import StudentChat from "../pages/student/StudentChat";
import Seller from "../pages/student/Seller";
export default function AppRoutes() {
    return (_jsx(CartProvider, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(LandingPage, {}) }), _jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/register", element: _jsx(Register, {}) }), _jsx(Route, { path: "/forgot-password", element: _jsx(ForgotPassword, {}) }), _jsx(Route, { path: "/reset-password", element: _jsx(ResetPassword, {}) }), _jsxs(Route, { path: "/admin", element: _jsx(AdminLayout, {}), children: [_jsx(Route, { index: true, element: _jsx(Navigate, { to: "dashboard", replace: true }) }), _jsx(Route, { path: "dashboard", element: _jsx(AdminDashboard, {}) }), _jsx(Route, { path: "manage-users", element: _jsx(ManageUsers, {}) }), _jsx(Route, { path: "manage-listings", element: _jsx(ManageListings, {}) }), _jsx(Route, { path: "manage-orders", element: _jsx(ManageOrders, {}) }), _jsx(Route, { path: "reports", element: _jsx(ReportsPage, {}) }), _jsx(Route, { path: "analytics", element: _jsx(Analytics, {}) }), _jsx(Route, { path: "settings", element: _jsx(Settings, {}) }), _jsx(Route, { path: "profile", element: _jsx(AdminProfile, {}) })] }), _jsxs(Route, { path: "/student", element: _jsx(StudentLayout, {}), children: [_jsx(Route, { index: true, element: _jsx(Navigate, { to: "dashboard", replace: true }) }), _jsx(Route, { path: "dashboard", element: _jsx(StudDashboard, {}) }), _jsx(Route, { path: "sell", element: _jsx(Sell, {}) }), _jsx(Route, { path: "listings", element: _jsx(Listings, {}) }), _jsx(Route, { path: "product", element: _jsx(StudentProduct, {}) }), _jsx(Route, { path: "messages", element: _jsx(Messages, {}) }), _jsx(Route, { path: "messages/:listingId/:otherUserId", element: _jsx(StudentChat, {}) }), _jsx(Route, { path: "profile", element: _jsx(Profile, {}) }), _jsx(Route, { path: "listing/:id", element: _jsx(StudentProduct, {}) }), _jsx(Route, { path: "cart", element: _jsx(Cart, {}) }), _jsx(Route, { path: "checkout", element: _jsx(StudentCheckout, {}) }), _jsx(Route, { path: "checkoutsuccess", element: _jsx(CheckoutSuccess, {}) }), _jsx(Route, { path: "orders", element: _jsx(Orders, {}) }), _jsx(Route, { path: "Seller", element: _jsx(Seller, {}) }), _jsx(Route, { path: "*", element: _jsx("div", { style: { padding: 20 }, children: "Not Found" }) })] })] }) }));
}
