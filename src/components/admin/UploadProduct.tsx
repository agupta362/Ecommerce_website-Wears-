import { useState, useEffect } from "react";
import { supabase } from "../../integrations/supabase/client";

interface GeneratedProduct {
  name?: string;
  category?: string;
  colors?: string[];
  description?: string;
}

export default function UploadProduct() {
  const [caption, setCaption] = useState("");
  const [generated, setGenerated] = useState<GeneratedProduct | null>(null);
  const [categories, setCategories] = useState<{ id: number; name: string; slug: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (error) console.error(error);
  else
    setCategories(
      (data || []).map(c => ({
        id: Number(c.id),
        name: c.name,
        slug: c.slug,
      }))
    );
  };
      fetchCategories();
  }, []);
  
  //   const fetchCategories = async () => {
  //     const { data, error } = await supabase
  //       .from("categories")
  //       .select("id, name, slug")
  //       .order("name", { ascending: true });
  //     if (error) console.error(error);
  //     else setCategories(data || []);
  //   };
  //   fetchCategories();
  // }, []);

  // Generate product from AI
  const generateProduct = async () => {
    
    if (!caption) return alert("Paste a caption first");
    setLoading(true);

    try {
      const res = await fetch("/api/generate-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption }),
      });

      const dataRaw = await res.text();
      try {
        const data = JSON.parse(dataRaw);
        if (selectedCategory) data.category = selectedCategory;
        setGenerated(data);
      } catch (err) {
        console.error("AI returned invalid JSON:", dataRaw);
        alert("Failed to generate product. Try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate product. Try again.");
    }

    setLoading(false);
  };

  // Upload images to Supabase Storage
  const uploadImages = async () => {
    if (!images.length) return [];
    const urls: string[] = [];

    for (const file of images) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}.${fileExt}`;
      const { error } = await supabase.storage.from("products").upload(fileName, file);
      if (error) console.error(error);
      else {
        const url = supabase.storage.from("products").getPublicUrl(fileName).data.publicUrl;
        urls.push(url);
      }
    }

    return urls;
  };

  // Save product to Supabase
  const saveProduct = async () => {
    
    if (!generated?.name) return alert("Generate product first");
    setLoading(true);

    const imageUrls = await uploadImages();
    const { error } = await supabase.from("products").insert([
  {
    name: generated.name,
    price: 0, 
    category_id: categories.find(c => c.slug === generated.category)?.id?.toString() || null, // ✅ FIXED
    description: generated.description,
    slug: generated.name.toLowerCase().replace(/\s+/g, "-"),
    images: imageUrls,
  },
]);


    if (error) console.error(error);
    else alert("Product saved!");
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">AI Product Upload</h1>

      <textarea
        placeholder="Paste Instagram caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="w-full h-24 border p-2 mb-4"
      />

      <div className="mb-4">
        <label>Category:</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border p-2 ml-2"
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label>Upload Images:</label>
        <input
          type="file"
          multiple
          onChange={(e) => setImages(Array.from(e.target.files || []))}
          className="block mt-2"
        />
      </div>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
        onClick={generateProduct}
      >
        {loading ? "Generating..." : "Generate Product"}
      </button>

      <button
        className="bg-green-600 text-white px-4 py-2 rounded"
        onClick={saveProduct}
      >
        {loading ? "Saving..." : "Save Product"}
      </button>

      {generated && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <h2 className="font-bold">Generated Product</h2>
          <p><b>Name:</b> {generated.name}</p>
          <p><b>Category:</b> {generated.category}</p>
          <p><b>Colors:</b> {generated.colors?.join(", ")}</p>
          <p><b>Description:</b> {generated.description}</p>
        </div>
      )}
    </div>
  );
}