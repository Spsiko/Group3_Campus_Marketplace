import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import AdminFooter from "./AdminFooter";
import "../style/adminlayout.scss";
export default function AdminLayout() {
    const [open, setOpen] = useState(false);
    return (_jsxs("div", { className: "admin-shell", children: [_jsx(AdminHeader, { open: open, setOpen: setOpen }), _jsx(AdminSidebar, { open: open, onClose: () => setOpen(false) }), _jsx("main", { className: `admin-main ${open ? "shifted" : ""}`, children: _jsx(Outlet, {}) }), _jsx(AdminFooter, {})] }));
}
