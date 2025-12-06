import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { getResolvedUser } from "../../lib/resolvedUser";
import "../../style/MyListings.scss";

export default function MyListings() {
  const [authUser, setAuthUser] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const u = await getResolvedUser();
      setAuthUser(u || null);
    }
    loadUser();
  }, []);

  useEffect(() => {
    if (!authUser?.auth_user_id) return;

    async function loadListings() {
      setLoading(true);

      const { data, error } = await supabase
        .from("listings")
        .select("id, title, price, status, image_urls, created_at")
        .eq("seller_id", authUser.auth_user_id)
        .order("created_at", { ascending: false });

      if (!error && data) setListings(data);

      setLoading(false);
    }

    loadListings();
  }, [authUser]);

  if (!authUser) return <p>Loading...</p>;

  return (
    <div className="my-listings-page">
      <h2>My Listings</h2>

      {loading ? (
        <p>Loading listings...</p>
      ) : listings.length === 0 ? (
        <p>No listings found.</p>
      ) : (
        <div className="listings-grid">
          {listings.map((l) => (
            <div key={l.id} className="listing-card">
              <img
                src={l.image_urls?.[0] || "/placeholder.jpg"}
                alt={l.title}
              />

              <h3>{l.title}</h3>
              <p className="status">
                Status: <strong>{l.status}</strong>
              </p>

              <p className="price">${l.price}</p>

              <button
                className={`btn ${l.status === "sold" ? "disabled" : "primary"}`}
                disabled={l.status === "sold"}
                onClick={() =>
                  window.location.assign(`/student/editlistings/${l.id}`)
                }
              >
                {l.status === "sold" ? "Not Editable" : "Edit"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
