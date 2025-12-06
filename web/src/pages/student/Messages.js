import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import "../../style/studentmessages.scss";
const MOCK_MESSAGES = [
    {
        id: 1,
        from: "Alex P.",
        preview: "Hi! Is your Dell XPS still available?",
        time: "2:45 PM",
        full: [
            "Hi! Is your Dell XPS still available?",
            "Yes, it is! It’s in great condition.",
            "Awesome — can I see it tomorrow around noon?",
            "Sure, let's meet near the library.",
        ],
    },
    {
        id: 2,
        from: "Maya R.",
        preview: "Hey, can you do $50 for the textbook set?",
        time: "Yesterday",
        full: [
            "Hey, can you do $50 for the textbook set?",
            "I can go down to $55, would that work?",
        ],
    },
];
export default function StudentMessages() {
    const [selected, setSelected] = useState(MOCK_MESSAGES[0]);
    return (_jsx("section", { className: "student-messages", children: _jsxs("div", { className: "card", children: [_jsx("h1", { children: "Messages" }), _jsx("p", { className: "muted-sub", children: "View and reply to buyer or seller messages below." }), _jsxs("div", { className: "message-layout", children: [_jsx("aside", { className: "inbox", children: MOCK_MESSAGES.map((msg) => (_jsxs("div", { className: `inbox-item ${selected?.id === msg.id ? "is-active" : ""}`, onClick: () => setSelected(msg), children: [_jsxs("div", { className: "inbox-header", children: [_jsx("span", { className: "sender", children: msg.from }), _jsx("span", { className: "time", children: msg.time })] }), _jsx("p", { className: "preview", children: msg.preview })] }, msg.id))) }), _jsx("main", { className: "chat", children: selected ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "chat-header", children: [_jsx("strong", { children: selected.from }), _jsx("span", { className: "chat-status", children: "Active" })] }), _jsx("div", { className: "chat-body", children: selected.full.map((line, i) => (_jsx("div", { className: `bubble ${i % 2 === 0 ? "incoming" : "outgoing"}`, children: line }, i))) }), _jsxs("form", { className: "chat-input", children: [_jsx("input", { type: "text", placeholder: "Type a message...", className: "msg-box" }), _jsx("button", { className: "btn primary", type: "submit", children: "Send" })] })] })) : (_jsx("div", { className: "chat-empty", children: _jsx("p", { children: "Select a conversation to start messaging" }) })) })] })] }) }));
}
