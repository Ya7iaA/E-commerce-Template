import { useState, useCallback } from "react";
import StoreHeader from "@/components/StoreHeader";
import HeroSlider from "@/components/HeroSlider";
import ProductCatalog from "@/components/ProductCatalog";
import OrderForm from "@/components/OrderForm";
import { CartItem } from "@/types/store";
import WhatsAppButton from "@/components/WhatsAppButton";
import OrderTracker from "@/components/OrderTracker";

const Index = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string>('');

  const handleAddToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const existing = prev.findIndex(
        (c) => c.productId === item.productId && c.size === item.size
      );
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + 1 };
        return updated;
      }
      return [...prev, item];
    });
  }, []);

  const handleRemoveItem = useCallback((index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleOrderSuccess = (orderId: string) => {
    setCart([]);
    setLastOrderId(orderId);
    setOrderPlaced(true);
  };

  return (
    <div className="min-h-screen bg-background" dir="ltr">
      <StoreHeader />
      <HeroSlider />
      <ProductCatalog onAddToCart={handleAddToCart} />
      {orderPlaced ? (
        <section className="py-16 text-center">
          <div className="container mx-auto px-6 max-w-lg">
            <h2 className="text-2xl font-bold text-foreground font-display mb-3">Thank You!</h2>
            <p className="text-muted-foreground mb-4">
              We received your order and we will contact you to confirm it.
            </p>
            <p className="text-muted-foreground">
              To track your order, paste this ID in the tracking chat:
            </p>
            <div className="mt-3 inline-block rounded-lg bg-primary/10 border border-primary/20 px-5 py-2.5">
              <span className="font-mono text-lg font-bold text-primary select-all">{lastOrderId}</span>
            </div>
          </div>
        </section>
      ) : (
        <OrderForm
          cart={cart}
          onRemoveItem={handleRemoveItem}
          onSuccess={handleOrderSuccess}
        />
      )}
      <footer className="py-8 md:py-10 bg-foreground">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="font-display text-lg tracking-widest text-background/80">Tacti8AI</p>
              <p className="text-sm text-background/50 font-body mt-1">
                © {new Date().getFullYear()} All rights reserved.
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm font-semibold text-background/70 font-body mb-1">Built by <span className="text-primary">Your Name</span></p>
              <div className="flex items-center justify-center md:justify-end gap-3">
                <a href="https://wa.me/+201553745990" target="_blank" rel="noopener noreferrer" className="text-background/50 hover:text-primary transition-colors text-xs underline">WhatsApp</a>
                <span className="text-background/30">|</span>
                <a href="https://instagram.com/tacti8_ai" target="_blank" rel="noopener noreferrer" className="text-background/50 hover:text-primary transition-colors text-xs underline">Instagram</a>
                <span className="text-background/30">|</span>
                <a href="mailto:contact@tacti8ai.com" className="text-background/50 hover:text-primary transition-colors text-xs underline">Email</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <OrderTracker />
      <WhatsAppButton />
    </div>
  );
};

export default Index;