import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import "../../style/studentsell.scss";
export default function StudentSell() {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("Books");
    const [imagePreview, setImagePreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const onImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setImagePreview(URL.createObjectURL(file));
        // TODO: upload image to Supabase storage later
    };
    const onSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // TODO: save listing to Supabase database
            alert("Listing submitted successfully!");
            setTitle("");
            setDesc("");
            setPrice("");
            setImagePreview(null);
        }
        catch (err) {
            console.error(err);
            alert("Failed to submit listing");
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsx("section", { className: "student-sell", children: _jsxs("div", { className: "card", children: [_jsx("h1", { children: "Sell an Item" }), _jsx("p", { className: "muted-sub", children: "Fill out the form below to post your item to the Campus Marketplace." }), _jsxs("form", { className: "form", onSubmit: onSubmit, children: [_jsxs("div", { className: "image-upload", children: [_jsx("img", { className: "preview", src: imagePreview || "/placeholder-image.png", alt: "Image Preview" }), _jsxs("label", { className: "upload-btn", children: ["Upload Photo", _jsx("input", { type: "file", accept: "image/*", onChange: onImageChange })] })] }), _jsxs("div", { className: "grid", children: [_jsxs("div", { className: "field", children: [_jsx("label", { children: "Title" }), _jsx("input", { placeholder: "Ex: Used Laptop - Dell XPS 13", value: title, onChange: (e) => setTitle(e.target.value), required: true })] }), _jsxs("div", { className: "field", children: [_jsx("label", { children: "Category" }), _jsxs("select", { value: category, onChange: (e) => setCategory(e.target.value), children: [_jsx("option", { children: "Books" }), _jsx("option", { children: "Electronics" }), _jsx("option", { children: "Furniture" }), _jsx("option", { children: "Clothing" }), _jsx("option", { children: "Other" })] })] }), _jsxs("div", { className: "field", children: [_jsx("label", { children: "Price ($)" }), _jsx("input", { type: "number", placeholder: "Ex: 50", value: price, onChange: (e) => setPrice(e.target.value), required: true })] }), _jsxs("div", { className: "field span-2", children: [_jsx("label", { children: "Description" }), _jsx("textarea", { placeholder: "Describe the condition, brand, and any important details...", value: desc, onChange: (e) => setDesc(e.target.value), rows: 4, required: true })] })] }), _jsxs("div", { className: "actions", children: [_jsx("button", { className: "btn primary", type: "submit", disabled: saving, children: saving ? "Posting..." : "Post Listing" }), _jsx("button", { className: "btn ghost", type: "button", onClick: () => window.history.back(), children: "Cancel" })] })] })] }) }));
}
