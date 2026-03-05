import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check } from 'lucide-react';
import { Product, CartItem } from '@/types/store';

interface ProductCardProps {
  product: Product;
  onAddToCart: (item: CartItem) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const hasDiscount = product.originalPrice > product.discountedPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100)
    : 0;

  const handleAdd = () => {
    onAddToCart({
      productId: product.id,
      name: product.name,
      size: selectedSize,
      quantity,
      price: product.discountedPrice,
      image: product.image,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
    setQuantity(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className={`h-full w-full object-cover transition-transform duration-500 ${product.inStock === false ? 'opacity-50 grayscale' : 'group-hover:scale-105'}`}
          loading="lazy"
        />
        {product.inStock === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <span className="rounded-md bg-destructive px-3 py-1.5 text-sm font-bold text-destructive-foreground">
              Out of Stock
            </span>
          </div>
        )}
        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-md bg-destructive px-2 py-1 text-xs font-bold text-destructive-foreground">
            -{discountPercent}%
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="mb-2 text-base font-semibold text-card-foreground">{product.name}</h3>

        <div className="mb-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">
            {product.discountedPrice} EGP
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {product.originalPrice} EGP
            </span>
          )}
        </div>

        {/* Size selector */}
        <div className="mb-3">
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Size</p>
          <div className="flex flex-wrap gap-1.5">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`rounded-md border px-3 py-1 text-xs font-medium transition-colors ${
                  selectedSize === size
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-muted text-foreground hover:border-primary'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div className="mb-4 flex items-center gap-3">
          <p className="text-xs font-medium text-muted-foreground">Quantity</p>
          <div className="flex items-center rounded-md border border-border">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-2.5 py-1 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              −
            </button>
            <span className="min-w-[2rem] text-center text-sm font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-2.5 py-1 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              +
            </button>
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={justAdded || product.inStock === false}
          className={`flex w-full items-center justify-center gap-1.5 md:gap-2 rounded-lg py-2 md:py-2.5 text-xs md:text-sm font-semibold transition-all ${
            product.inStock === false
              ? 'cursor-not-allowed bg-muted text-muted-foreground opacity-60'
              : justAdded
              ? 'bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]'
              : 'bg-secondary text-secondary-foreground hover:opacity-90'
          }`}
        >
          {justAdded ? (
            <>
              <Check className="h-4 w-4" />
              Added!
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Add to Order
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
