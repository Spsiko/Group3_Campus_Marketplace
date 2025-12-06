import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { getResolvedUser } from "../lib/resolvedUser";
import "../style/StudentReport.scss";

// ----- Types -----
type ReportListingInput = {
  id: string;
  seller_id: string; // seller auth_user_id
  reportType: "listing" | "user";
};

export default function StudentReportModal({
  listing,
  onClose
}: {
  listing: ReportListingInput;
  onClose: () => void;
}) {
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("Low");
  const [description, setDescription] = useState("");

  // -------------------------------------------
  // Allowed categories based on reportType
  // -------------------------------------------
  const categoryOptions =
    listing.reportType === "user"
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

  return (
    <div className="report-modal">
      <div className="report-box">
        <h3>Report {listing.reportType === "user" ? "User" : "Listing"}</h3>

        {/* Category */}
        <label>Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select a category...</option>
          {categoryOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Priority */}
        <label>Priority</label>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>

        {/* Description */}
        <label>Description</label>
        <textarea
          value={description}
          placeholder="Describe the issue…"
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="actions">
          <button className="btn danger" onClick={submitReport}>
            Submit Report
          </button>
          <button className="btn ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
