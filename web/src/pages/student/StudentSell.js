import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { getResolvedUser } from "../../lib/resolvedUser";
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
    const [authUser, setAuthUser] = useState(null);
    const [sellerId, setSellerId] = useState(null);
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
    const [imageUrls, setImageUrls] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
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
    const handleUpload = async (e) => {
        const files = e.target.files;
        if (!files)
            return;
        setUploading(true);
        setUploadError(null);
        try {
            const uploadedUrls = [];
            for (const file of Array.from(files)) {
                const ext = file.name.split(".").pop();
                const uniqueName = `${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2)}.${ext}`;
                const filePath = `${authUser?.email}/${uniqueName}`;
                const { error: uploadErr } = await supabase.storage
                    .from("product-images")
                    .upload(filePath, file);
                if (uploadErr)
                    throw uploadErr;
                const { data: publicData } = supabase.storage
                    .from("product-images")
                    .getPublicUrl(filePath);
                if (publicData?.publicUrl)
                    uploadedUrls.push(publicData.publicUrl);
            }
            setImageUrls((prev) => [...prev, ...uploadedUrls]);
        }
        catch (error) {
            setUploadError(error.message || "Image upload failed.");
        }
        finally {
            setUploading(false);
        }
    };
    const handleSubmit = async (e) => {
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
        }
        else {
            setMessage("Listing posted successfully!");
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
    return (_jsxs("div", { style: { maxWidth: "700px", margin: "auto", padding: "24px" }, children: [_jsx("h2", { children: "Create Listing" }), message && (_jsx("p", { children: _jsx("strong", { children: message }) })), _jsxs("form", { onSubmit: handleSubmit, style: { display: "grid", gap: 16 }, children: [_jsxs("div", { children: [_jsx("label", { children: "Title *" }), _jsx("input", { value: title, onChange: (e) => setTitle(e.target.value), style: { width: "100%" } })] }), _jsxs("div", { children: [_jsx("label", { children: "Category *" }), _jsxs("select", { value: category, onChange: (e) => setCategory(e.target.value), style: { width: "100%" }, children: [_jsx("option", { value: "", children: "Select" }), CATEGORIES.map((c) => (_jsx("option", { value: c.value, children: c.label }, c.value)))] })] }), _jsxs("div", { children: [_jsx("label", { children: "Description *" }), _jsx("textarea", { value: description, rows: 4, onChange: (e) => setDescription(e.target.value), style: { width: "100%" } })] }), _jsxs("div", { children: [_jsx("label", { children: "Condition *" }), _jsxs("select", { value: condition, onChange: (e) => setCondition(e.target.value), style: { width: "100%" }, children: [_jsx("option", { value: "", children: "Select" }), CONDITION_OPTIONS.map((v) => (_jsx("option", { value: v, children: v }, v)))] })] }), _jsxs("div", { children: [_jsx("label", { children: "Price *" }), _jsx("input", { type: "number", min: "0", value: price, onChange: (e) => setPrice(e.target.value), style: { width: "100%" } })] }), _jsx("div", { children: _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: isNegotiable, onChange: (e) => setIsNegotiable(e.target.checked) }), "Negotiable"] }) }), _jsxs("div", { children: [_jsx("label", { children: "Location" }), _jsx("input", { value: locationText, onChange: (e) => setLocationText(e.target.value), style: { width: "100%" } })] }), _jsxs("div", { children: [_jsx("label", { children: "Images" }), _jsx("input", { type: "file", multiple: true, accept: "image/*", onChange: handleUpload }), uploading && _jsx("p", { children: "Uploading..." }), uploadError && _jsx("p", { style: { color: "red" }, children: uploadError }), _jsx("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }, children: imageUrls.map((url, idx) => (_jsx("img", { src: url, style: { width: 80, height: 80, objectFit: "cover" } }, idx))) })] }), _jsx("button", { type: "submit", disabled: loading || !sellerId, children: loading ? "Posting..." : "Post Listing" })] })] }));
};
export default StudentSell;
