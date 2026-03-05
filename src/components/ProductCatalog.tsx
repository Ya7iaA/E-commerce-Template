import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import ProductCard from "./ProductCard";
import { Product, CartItem } from "@/types/store";
import { demoProducts } from "@/data/products";
import { WEBHOOKS } from "@/config/webhooks";

interface ProductCatalogProps {
  onAddToCart: (item: CartItem) => void;
}

const ProductCatalog = ({ onAddToCart }: ProductCatalogProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!WEBHOOKS.GET_PRODUCTS) {
        setProducts(demoProducts);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(WEBHOOKS.GET_PRODUCTS);
        const data = await res.json();
        setProducts(data);
      } catch {
        setProducts(demoProducts);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <section id="products" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="section-heading text-foreground">Our Collection</h2>
          <p className="mt-3 text-muted-foreground font-body max-w-md mx-auto">
            Discover pieces crafted with passion and precision.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 lg:gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCatalog;
