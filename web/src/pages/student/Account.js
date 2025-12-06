import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import "../../style/theme.css";
import Layout from '../../layout/Layout';
import { getUser, signOut } from '../../lib/auth';
import { useNavigate } from 'react-router-dom';
export default function Account() {
    const user = getUser();
    const navigate = useNavigate();
    function handleSignOut() {
        signOut();
        navigate('/login', { replace: true });
    }
    return (_jsx(Layout, { title: "Account", children: _jsx("div", { className: "pfw-card", style: { maxWidth: 640 }, children: _jsx("div", { className: "pfw-card__body", children: user ? (_jsxs(_Fragment, { children: [_jsxs("p", { style: { margin: 0 }, children: [_jsx("strong", { children: "Name:" }), " ", user.name] }), _jsxs("p", { style: { marginTop: 6 }, children: [_jsx("strong", { children: "Email:" }), " ", user.email] }), _jsx("div", { style: { marginTop: 12 }, children: _jsx("button", { className: "pfw-btn pfw-btn--gold", onClick: handleSignOut, children: "Sign out" }) })] })) : (_jsxs(_Fragment, { children: [_jsx("p", { className: "pfw-muted", children: "You are not signed in." }), _jsx("a", { className: "pfw-btn pfw-btn--primary", href: "/login", style: { marginTop: 12 }, children: "Go to Login" })] })) }) }) }));
}
