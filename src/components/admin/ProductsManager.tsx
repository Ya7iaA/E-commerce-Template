import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdminProduct } from "@/types/admin";
import { WEBHOOKS } from "@/config/webhooks";

interface ProductForm {
  name: string;
  image: string;
  originalPrice: string;
  discountedPrice: string;
  sizes: string;
  inStock: boolean;
}

const emptyForm: ProductForm = {
  name: "",
  image: "",
  originalPrice: "",
  discountedPrice: "",
  sizes: "",
  inStock: true,
};

const ProductsManager = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(WEBHOOKS.GET_ADMIN_PRODUCTS);
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch {
      toast({ title: "Error", description: "Failed to load products", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImagePreview("");
    setModalOpen(true);
  };

  const openEdit = (p: AdminProduct) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      image: p.image,
      originalPrice: p.originalPrice.toString(),
      discountedPrice: p.discountedPrice.toString(),
      sizes: p.sizes || "",
      inStock: p.inStock,
    });
    setImagePreview(p.image);
    setModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "Image must be under 5MB", variant: "destructive" });
      return;
    }
    const img = new Image();
    img.onload = () => {
      const MAX = 800;
      let w = img.width, h = img.height;
      if (w > MAX || h > MAX) {
        const ratio = Math.min(MAX / w, MAX / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, w, h);
      const webpDataUrl = canvas.toDataURL("image/webp", 0.75);
      setForm((f) => ({ ...f, image: webpDataUrl }));
      setImagePreview(webpDataUrl);
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Error", description: "Product name is required", variant: "destructive" });
      return;
    }
    if (!form.discountedPrice) {
      toast({ title: "Error", description: "Price is required", variant: "destructive" });
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      image: form.image || "/placeholder.svg",
      originalPrice: Number(form.originalPrice) || 0,
      discountedPrice: Number(form.discountedPrice) || 0,
      sizes: form.sizes,
      inStock: form.inStock,
      ...(editingId ? { id: editingId } : {}),
    };

    try {
      const url = editingId ? WEBHOOKS.UPDATE_PRODUCT : WEBHOOKS.ADD_PRODUCT;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Success", description: editingId ? "Product updated" : "Product added" });
      setModalOpen(false);
      fetchProducts();
    } catch {
      toast({ title: "Error", description: "Failed to save product", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      const res = await fetch(WEBHOOKS.DELETE_PRODUCT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Deleted", description: "Product removed" });
      fetchProducts();
    } catch {
      toast({ title: "Error", description: "Failed to delete product", variant: "destructive" });
    }
  };

  return (
    <div className="p-2 md:p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-black uppercase text-foreground">Products</h2>
          <p className="text-sm text-muted-foreground">{products.length} total products</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Product</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">No products yet. Add your first product!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          <AnimatePresence>
            {products.map((product) => {
              const discount = product.originalPrice > product.discountedPrice
                ? Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100)
                : 0;
              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-card border border-border rounded-lg overflow-hidden"
                >
                  <div className="relative aspect-square">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-muted-foreground/40" />
                      </div>
                    )}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                        <span className="text-foreground font-display font-bold text-sm uppercase">Out of Stock</span>
                      </div>
                    )}
                    {discount > 0 && (
                      <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-sm">
                        -{discount}%
                      </span>
                    )}
                  </div>
                  <div className="p-3 md:p-4 space-y-2">
                    <h3 className="font-display font-semibold text-foreground text-sm truncate">{product.name}</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-primary font-bold">{product.discountedPrice} EGP</span>
                      {discount > 0 && <span className="text-muted-foreground line-through text-xs">{product.originalPrice}</span>}
                    </div>
                    {product.sizes && (
                      <p className="text-xs text-muted-foreground">Sizes: {product.sizes}</p>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => openEdit(product)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 border border-border rounded-md text-foreground hover:bg-secondary transition-colors"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 border border-border rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="font-display font-bold text-foreground">{editingId ? "Edit Product" : "Add Product"}</h2>
                <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                {/* Image upload */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Product Image</label>
                  <div className="flex items-start gap-4">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-md object-cover border border-border" />
                    ) : (
                      <div className="w-24 h-24 rounded-md border border-dashed border-border flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                      </div>
                    )}
                    <label className="cursor-pointer bg-secondary text-foreground text-sm font-medium px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors">
                      Upload Image
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-secondary border-none rounded-md px-4 py-3 text-foreground focus:ring-1 focus:ring-primary outline-none"
                    placeholder="Product name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Original Price (EGP)</label>
                    <input
                      type="number"
                      value={form.originalPrice}
                      onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                      className="w-full bg-secondary border-none rounded-md px-4 py-3 text-foreground focus:ring-1 focus:ring-primary outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Discounted Price (EGP)</label>
                    <input
                      type="number"
                      value={form.discountedPrice}
                      onChange={(e) => setForm({ ...form, discountedPrice: e.target.value })}
                      className="w-full bg-secondary border-none rounded-md px-4 py-3 text-foreground focus:ring-1 focus:ring-primary outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Sizes (format: S:5, M:10, L:8)</label>
                  <input
                    value={form.sizes}
                    onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                    placeholder="S:5, M:10, L:8, XL:3"
                    className="w-full bg-secondary border-none rounded-md px-4 py-3 text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, inStock: !form.inStock })}
                    className={`w-10 h-6 rounded-full transition-colors relative ${form.inStock ? "bg-primary" : "bg-secondary"}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-foreground transition-transform ${form.inStock ? "left-[18px]" : "left-0.5"}`} />
                  </button>
                  <span className="text-sm text-foreground">{form.inStock ? "In Stock" : "Out of Stock"}</span>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-primary text-primary-foreground font-display font-bold py-3 rounded-md hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductsManager;
