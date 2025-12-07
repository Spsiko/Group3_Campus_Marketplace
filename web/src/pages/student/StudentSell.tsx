import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { getResolvedUser } from "../../lib/resolvedUser";
import { notifyListingPosted } from "../../lib/notifyextras";

const CATEGORIES = [
  { value: "electronics", label: "Electronics" },
  { value: "books", label: "Books" },
  { value: "furniture", label: "Furniture" },
  { value: "clothing", label: "Clothing" },
  { value: "other", label: "Other" },
];

// UPDATED: Condition enum options
const CONDITION_OPTIONS = ["new", "good", "like_new", "fair"];

const StudentSell = () => {
  const [authUser, setAuthUser] = useState<any>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  // UPDATED: status is always "pending"
  //const [status] = useState("pending");

  // UPDATED: currency is always "USD"
  //const [currency] = useState("USD");

  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");

  const [isNegotiable, setIsNegotiable] = useState(false);
  const [locationText, setLocationText] = useState("");

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ********************************************
  // ONLY CHANGE: use getResolvedUser()
  // ********************************************
  useEffect(() => {
    async function load() {
      const u = await getResolvedUser();
      if (!u) {
        setMessage("Please log in before creating a listing.");
        return;
      }

      setAuthUser(u);
      setSellerId(u.auth_user_id); // FIXED
    }
    load();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    setUploadError(null);

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const uniqueName = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;
        const filePath = `${authUser?.email}/${uniqueName}`;

        const { error: uploadErr } = await supabase.storage
          .from("product-images")
          .upload(filePath, file);

        if (uploadErr) throw uploadErr;

        const { data: publicData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        if (publicData?.publicUrl) uploadedUrls.push(publicData.publicUrl);
      }

      setImageUrls((prev) => [...prev, ...uploadedUrls]);
    } catch (error: any) {
      setUploadError(error.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authUser || !sellerId) {
      setMessage("User account not loaded yet.");
      return;
    }

    if (!title || !description || !category || !price || !condition) {
      setMessage("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    const now = new Date().toISOString();

    const { error } = await supabase.from("listings").insert([
      {
        product_id: crypto.randomUUID(),
        category,
        title,
        description,
        condition,

        status: "pending",
        currency: "USD",

        price: Number(price),
        quantity: 1,
        is_negotiable: isNegotiable,

        image_urls: imageUrls,
        thumbnail_url: imageUrls[0] || null,

        location_text: locationText,

        seller_id: sellerId,

        views_count: 0,
        favorites_count: 0,
        created_at: now,
        updated_at: now,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error("Insert error:", error);
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Listing posted successfully!");

        // 🔔 NEW: Send listing notification
      await notifyListingPosted(
      sellerId,    // seller auth_user_id
      title        // listing title
      );
      
      setTitle("");
      setCategory("");
      setDescription("");
      setCondition("");
      setPrice("");
      setIsNegotiable(false);
      setLocationText("");
      setImageUrls([]);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "auto", padding: "24px" }}>
      <h2>Create Listing</h2>

      {message && (
        <p>
          <strong>{message}</strong>
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
        <div>
          <label>Title *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%" }} />
        </div>

        <div>
          <label>Category *</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: "100%" }}>
            <option value="">Select</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Description *</label>
          <textarea value={description} rows={4} onChange={(e) => setDescription(e.target.value)} style={{ width: "100%" }} />
        </div>

        <div>
          <label>Condition *</label>
          <select value={condition} onChange={(e) => setCondition(e.target.value)} style={{ width: "100%" }}>
            <option value="">Select</option>
            {CONDITION_OPTIONS.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Price *</label>
          <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} style={{ width: "100%" }} />
        </div>

        <div>
          <label>
            <input type="checkbox" checked={isNegotiable} onChange={(e) => setIsNegotiable(e.target.checked)} />
            Negotiable
          </label>
        </div>

        <div>
          <label>Location</label>
          <input value={locationText} onChange={(e) => setLocationText(e.target.value)} style={{ width: "100%" }} />
        </div>

        <div>
          <label>Images</label>
          <input type="file" multiple accept="image/*" onChange={handleUpload} />

          {uploading && <p>Uploading...</p>}
          {uploadError && <p style={{ color: "red" }}>{uploadError}</p>}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
            {imageUrls.map((url, idx) => (
              <img key={idx} src={url} style={{ width: 80, height: 80, objectFit: "cover" }} />
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading || !sellerId}>
          {loading ? "Posting..." : "Post Listing"}
        </button>
      </form>
    </div>
  );
};

export default StudentSell;
