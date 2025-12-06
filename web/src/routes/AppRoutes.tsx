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
import Listings from "../pages/student/Listings"
import Profile from "../pages/student/StudentProfile";
import StudentProduct from "../pages/student/StudentProduct";
import Cart from "../pages/student/StudentCart";
import StudentCheckout from "../pages/student/StudentCheckout"
import CheckoutSuccess from "../pages/student/CheckoutSuccess";
import Orders from "../pages/student/StudentOrders";
import StudentChat from "../pages/student/StudentChat";
import SellerOrders from "../pages/student/SellerOrders";
import MyListings from "../pages/student/MyListings";
import EditListings from "../pages/student/EditListings";

export default function AppRoutes() {
  return (
    <CartProvider>
    <Routes>
      {/* public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* admin */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="manage-users" element={<ManageUsers />} />
        <Route path="manage-listings" element={<ManageListings />} />
        <Route path="manage-orders" element={<ManageOrders />} /> 
        <Route path="reports" element={<ReportsPage />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      {/* student */}

        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudDashboard />} />
          <Route path="sell" element={<Sell />} />
          <Route path="listings" element={<Listings />} />
          <Route path="product" element={<StudentProduct />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:listingId/:otherUserId" element={<StudentChat />} />
          <Route path="profile" element={<Profile />} />
          <Route path="listing/:id" element={<StudentProduct />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<StudentCheckout />} />
          <Route path="checkoutsuccess" element={<CheckoutSuccess />} />
          <Route path="orders" element={<Orders />} />
          <Route path="SellerOrders" element={<SellerOrders />} />
          <Route path="mylistings" element={<MyListings />} />
          <Route path="editlistings/:id" element={<EditListings />} />
          <Route path="*" element={<div style={{ padding: 20 }}>Not Found</div>} />
        </Route>
      
    </Routes>
    </CartProvider>
  );
}
