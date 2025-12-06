import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import "../style/adminheader.scss";
export default function AdminHeader({ open, setOpen }) {
    return (_jsxs("header", { className: "admin-header", children: [_jsx("button", { className: "brand", type: "button", onClick: () => setOpen(!open), "aria-label": "Toggle admin sidebar", children: "Campus Marketplace" }), _jsx("div", {})] }));
}
