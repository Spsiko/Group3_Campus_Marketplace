import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import StudentHeader from "./StudentHeader";
import StudentSidebar from "./StudentSidebar";
import StudentFooter from "./StudentFooter";
import "../style/StudentLayout.scss";
export default function StudentLayout() {
    const [open, setOpen] = useState(false);
    return (_jsxs("div", { className: "student-shell", children: [_jsx(StudentHeader, { open: open, setOpen: setOpen }), _jsx(StudentSidebar, { open: open, onClose: () => setOpen(false) }), _jsx("main", { className: `student-main ${open ? "shifted" : ""}`, children: _jsx(Outlet, {}) }), _jsx(StudentFooter, {})] }));
}
