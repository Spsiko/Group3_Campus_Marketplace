// src/pages/student/EditListing.tsx

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useParams, useNavigate } from "react-router-dom";
import "../../style/EditListings.scss";

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState<any>(null);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchListing() {
      setLoading(true);

      const { data, error } = await supabase
        .from("listings")
        .select("id, title, price, status, image_urls")
        .eq("id", id)
        .single();

      if (error || !data) {
        alert("Listing not found");
        navigate("/student/mylistings");
        return;
      }

      setListing(data);
      setNewPrice(data.price);
      setLoading(false);
    }

    fetchListing();
  }, [id]);

  // ------------------------------------------------------------
  // SAVE UPDATED PRICE
  // ------------------------------------------------------------
  async function onSave() {
    if (!newPrice || newPrice <= 0) {
      alert("Invalid price entered.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("listings")
      .update({ price: newPrice })
      .eq("id", id);

    setSaving(false);

    if (error) {
      alert("Unable to update listing.");
      return;
    }

    alert("Listing updated successfully!");
    navigate("/student/mylistings");
  }

  // ------------------------------------------------------------
  // DELETE LISTING
  // ------------------------------------------------------------
  async function onDelete() {
    // sold listings cannot be deleted
    if (listing.status === "sold") {
      alert("Sold listings cannot be deleted.");
      return;
    }

    const yes = confirm(
      `Are you sure you want to delete "${listing.title}"? This cannot be undone.`
    );

    if (!yes) return;

    setSaving(true);

    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", id);

    setSaving(false);

    if (error) {
      alert("Failed to delete listing.");
      return;
    }

    alert("Listing deleted.");
    navigate("/my-listings");
  }

  if (loading || !listing)
    return <p style={{ padding: 20 }}>Loading listing...</p>;

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------
  return (
    <div className="edit-listing-page">
      <div className="card">
        <h2>Edit Listing</h2>

        <img
          src={listing.image_urls?.[0] || "/placeholder.jpg"}
          alt={listing.title}
          className="preview"
        />

        <h3>{listing.title}</h3>

        <p>
          <strong>Status:</strong> {listing.status}
        </p>

        {listing.status === "sold" ? (
          <p className="note">
            This listing has already been sold and cannot be edited or deleted.
          </p>
        ) : (
          <>
            <label>Price</label>
            <input
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(Number(e.target.value))}
            />

            <div className="actions">
              <button className="btn primary" onClick={onSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>

              <button
                className="btn ghost"
                onClick={() => navigate("/student/mylistings")}
                disabled={saving}
              >
                Cancel
              </button>
            </div>

            <button
              className="btn danger delete-btn"
              onClick={onDelete}
              disabled={saving}
            >
              Delete Listing
            </button>
          </>
        )}
      </div>
    </div>
  );
}
