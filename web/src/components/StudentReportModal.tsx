import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { getResolvedUser } from "../lib/resolvedUser";
//import { sendNotificationToUser } from "../lib/notifications";
import "../style/StudentReport.scss";
import { notifyReportFiled } from "../lib/notifyextras";


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

  const categoryOptions =
    listing.reportType === "user"
      ? ["Harassment", "Scam/Fraud"]
      : ["Spam", "Fake Listing", "Inappropriate Content", "Scam/Fraud", "Other"];

  // -----------------------------------------------------------
  // Helper: Convert auth_user_id → internal users.id
  // -----------------------------------------------------------
  async function getInternalUserId(authId: string) {
    const { data } = await supabase
      .from("users")
      .select("id")
      .eq("auth_user_id", authId)
      .maybeSingle();

    return data?.id || null;
  }

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

    // 1. Resolve SELLER internal ID
    const reportedUserId = await getInternalUserId(listing.seller_id);
    if (!reportedUserId) {
      alert("Could not look up seller.");
      return;
    }

    // 2. Resolve REPORTER internal ID
    const reporterId = await getInternalUserId(user.auth_user_id);
    if (!reporterId) {
      alert("Could not resolve your profile.");
      return;
    }

    // ------------------------------------------------------
    // 3. Insert report
    // ------------------------------------------------------
    const { error } = await supabase.from("reports").insert({
      report_type: listing.reportType,
      reported_user_id: reportedUserId,
      reported_listing_id:
        listing.reportType === "listing" ? listing.id : null,
      reporter_id: reporterId,
      category,
      priority,
      status: "Open",
      description
    });

    if (error) {
      console.error("Report error:", error);
      alert(error.message);
      return;
    }

    // ------------------------------------------------------
    // 4. SEND NOTIFICATIONS
    // ------------------------------------------------------

    // Notify seller (they receive a report alert)
    /*
    await sendNotificationToUser(
      reportedUserId,
      `Your ${listing.reportType} has been reported for: ${category}`,
      reporterId // show reporter name instead of "system"
    );
    */

    await notifyReportFiled(
      user.auth_user_id,      // reporter auth ID
      listing.seller_id,      // seller auth ID
      listing.id,             // listing title or id (use title if available)
      category                // report category
    );
    

    // OPTIONAL: notify admin(s)
    // Uncomment once admin internal IDs are known:
    //
    // await sendNotificationToUser(
    //   ADMIN_INTERNAL_ID,
    //   `A new report was submitted for ${listing.reportType} (${listing.id})`,
    //   reporterId
    // );

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
