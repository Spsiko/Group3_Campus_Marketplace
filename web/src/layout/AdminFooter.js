import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import "../style/adminfooter.scss";
export default function AdminFooter() {
    return (_jsx("footer", { className: "admin-footer", role: "contentinfo", children: _jsxs("div", { className: "af-inner", children: [_jsxs("div", { className: "af-line", children: [_jsx("strong", { children: "Campus Marketplace" }), _jsx("span", { className: "sep", children: "|" }), _jsx("span", { children: "Purdue University Fort Wayne" })] }), _jsxs("div", { className: "af-line small", children: ["\u00A9 ", new Date().getFullYear(), " \u2014 All Rights Reserved"] })] }) }));
}
