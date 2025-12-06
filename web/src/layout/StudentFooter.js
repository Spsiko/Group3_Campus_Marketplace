import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import "../style/studentfooter.scss";
export default function StudentFooter() {
    return (_jsx("footer", { className: "student-footer", role: "contentinfo", children: _jsxs("div", { className: "sf-inner", children: [_jsxs("div", { className: "sf-line", children: [_jsx("strong", { children: "Campus Marketplace" }), _jsx("span", { className: "sep", children: "|" }), _jsx("span", { children: "Purdue University Fort Wayne" })] }), _jsxs("div", { className: "sf-line small", children: ["\u00A9 ", new Date().getFullYear(), " \u2014 All Rights Reserved"] })] }) }));
}
