import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { getResolvedUser } from "../lib/resolvedUser";
import "../style/StudentReport.scss";
export default function StudentReportModal({ listing, onClose }) {
    const [category, setCategory] = useState("");
    const [priority, setPriority] = useState("Low");
    const [description, setDescription] = useState("");
    // -------------------------------------------
    // Allowed categories based on reportType
    // -------------------------------------------
    const categoryOptions = listing.reportType === "user"
        ? ["Harassment", "Scam/Fraud"]
        : ["Spam", "Fake Listing", "Inappropriate Content", "Scam/Fraud", "Other"];
    async function submitReport() {
        const user = await getResolvedUser();
        if (!user) {
            alert("You must be logged in to submit a report.");
            return;
        }
        if (!category) {
            alert("Please select a category.");
            return;
        }
        // ------------------------------------------------------
        // 1. Convert SELLER auth_user_id → internal users.id
        // ------------------------------------------------------
        const { data: reportedUser, error: userErr } = await supabase
            .from("users")
            .select("id")
            .eq("auth_user_id", listing.seller_id)
            .single();
        if (userErr || !reportedUser) {
            alert("Could not look up seller.");
            console.error("Seller lookup error:", userErr);
            return;
        }
        const reportedUserId = reportedUser.id;
        // ------------------------------------------------------
        // 2. Convert REPORTER auth_user_id → internal users.id
        //    REQUIRED FOR FK: reports_reporter_id_fkey
        // ------------------------------------------------------
        const { data: reporterUser, error: reporterErr } = await supabase
            .from("users")
            .select("id")
            .eq("auth_user_id", user.auth_user_id)
            .single();
        if (reporterErr || !reporterUser) {
            alert("Could not find your user profile.");
            console.error("Reporter lookup error:", reporterErr);
            return;
        }
        const reporterId = reporterUser.id;
        // ------------------------------------------------------
        // 3. Insert the report (all values DB-valid)
        // ------------------------------------------------------
        const { error } = await supabase.from("reports").insert({
            report_type: listing.reportType, // "listing" or "user"
            reported_user_id: reportedUserId,
            reported_listing_id: listing.reportType === "listing" ? listing.id : null,
            reporter_id: reporterId, // FIXED FK
            category,
            priority, // "Low" | "Medium" | "High" | "Critical"
            status: "Open",
            description
        });
        if (error) {
            console.error("Report error:", error);
            alert(error.message);
            return;
        }
        alert("Report submitted successfully.");
        onClose();
    }
    return (_jsx("div", { className: "report-modal", children: _jsxs("div", { className: "report-box", children: [_jsxs("h3", { children: ["Report ", listing.reportType === "user" ? "User" : "Listing"] }), _jsx("label", { children: "Category" }), _jsxs("select", { value: category, onChange: (e) => setCategory(e.target.value), children: [_jsx("option", { value: "", children: "Select a category..." }), categoryOptions.map((c) => (_jsx("option", { value: c, children: c }, c)))] }), _jsx("label", { children: "Priority" }), _jsxs("select", { value: priority, onChange: (e) => setPriority(e.target.value), children: [_jsx("option", { value: "Low", children: "Low" }), _jsx("option", { value: "Medium", children: "Medium" }), _jsx("option", { value: "High", children: "High" }), _jsx("option", { value: "Critical", children: "Critical" })] }), _jsx("label", { children: "Description" }), _jsx("textarea", { value: description, placeholder: "Describe the issue\u2026", onChange: (e) => setDescription(e.target.value) }), _jsxs("div", { className: "actions", children: [_jsx("button", { className: "btn danger", onClick: submitReport, children: "Submit Report" }), _jsx("button", { className: "btn ghost", onClick: onClose, children: "Cancel" })] })] }) }));
}
