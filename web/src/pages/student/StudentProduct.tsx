import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useCart } from "../../context/CartContext";
import "../../style/studentproduct.scss";
//import { getUser } from "../../lib/auth";

// ADD THIS IMPORT
import StudentReportModal from "../../components/StudentReportModal";

type ListingRow = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  condition: string | null;
  price: string | number | null;
  status: string | null;
  image_urls: string[] | null;
  thumbnail_url: string | null;
  seller_id: string | null;
  created_at: string;
};

type Seller = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  auth_user_id: string | null;
};

export default function StudentProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [showReport, setShowReport] = useState(false);

  const [listing, setListing] = useState<ListingRow | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // fetch seller
  async function fetchSellerByAuthId(authId: string): Promise<Seller | null> {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email, avatar_url, auth_user_id")
      .eq("auth_user_id", authId)
      .single();

    if (error) {
      console.error("Seller fetch error:", error);
      return null;
    }
    return data as Seller;
  }

  // load listing + seller
  useEffect(() => {
    if (!id) {
      setError("Missing listing ID.");
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);

      const { data, error: listErr } = await supabase
        .from("listings")
        .select(
          "id, title, description, category, condition, price, status, image_urls, thumbnail_url, seller_id, created_at"
        )
        .eq("id", id)
        .single();

      if (listErr || !data) {
        console.error("Listing fetch error:", listErr);
        setError("Listing not found.");
        setLoading(false);
        return;
      }

      const row = data as ListingRow;
      setListing(row);

      const firstImg =
        row.thumbnail_url || row.image_urls?.[0] || null;
      setSelectedImage(firstImg);

      if (row.seller_id) {
        const sellerInfo = await fetchSellerByAuthId(row.seller_id);
        setSeller(sellerInfo);
      }

      setLoading(false);
    }

    load();
  }, [id]);

  if (loading) return <div className="student-product__loading">Loading…</div>;
  if (error) return <div className="student-product__error">{error}</div>;
  if (!listing)
    return (
      <div className="student-product__notfound">
        Listing not found.
        <button className="sp-back-btn" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );

  const priceNumber = Number(listing.price ?? 0);
  const images = listing.image_urls || [];

  const handleAddToCart = () => {
    addToCart({
      id: listing.id,
      title: listing.title,
      price: priceNumber,
      image: listing.thumbnail_url || images[0] || "",
      seller_id: listing.seller_id || "",
    });

    alert("Item added to cart!");
  };

  return (
    <section className="student-product">
      <div className="sp-container">
        {/* LEFT IMAGES */}
        <div className="sp-gallery">
          {selectedImage && (
            <img
              src={selectedImage}
              alt={listing.title}
              className="sp-main-img"
            />
          )}

          {images.length > 0 && (
            <div className="sp-thumb-row">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  className={`sp-thumb-btn ${
                    selectedImage === img ? "is-active" : ""
                  }`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${i + 1}`}
                    className="sp-thumb-img"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT DETAILS */}
        <div className="sp-details">
          <h1 className="sp-title">{listing.title}</h1>

          <div className="sp-price">${priceNumber.toFixed(2)}</div>

          <div className="sp-badges">
            {listing.category && <span className="sp-badge">{listing.category}</span>}
            {listing.condition && (
              <span className="sp-badge">Condition: {listing.condition}</span>
            )}
          </div>

          {listing.description && <p className="sp-desc">{listing.description}</p>}

          <div className="sp-meta">
            {seller ? (
              <>
                <p>
                  <strong>Seller:</strong> {seller.full_name || "Unknown"}
                </p>
                <p>
                  <strong>Email:</strong> {seller.email || "Not provided"}
                </p>
              </>
            ) : (
              <p className="sp-warning">Seller information not available.</p>
            )}
          </div>

          <div className="sp-actions">
            <button className="btn primary" onClick={handleAddToCart}>
              Add to Cart
            </button>

            {/* MESSAGE SELLER */}
            <button
              className="btn ghost"
              onClick={() =>
                navigate(
                  `/student/messages/${listing.id}/${listing.seller_id}`
                )
              }
            >
              Message Seller
            </button>

            {/* REPORT LISTING */}
            <button className="btn danger" onClick={() => setShowReport(true)}>
              Report
            </button>
          </div>
        </div>
      </div>

{showReport && (
  <StudentReportModal
    listing={{
      id: listing.id,
      seller_id: listing.seller_id ?? "",   
      reportType: "listing"                 
    }}
    onClose={() => setShowReport(false)}
  />
)}


    </section>
  );
}
