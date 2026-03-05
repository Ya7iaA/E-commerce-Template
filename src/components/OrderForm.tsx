import { useState } from 'react';
import { governorates } from '@/data/governorates';
import { CartItem, OrderPayload } from '@/types/store';
import { WEBHOOKS } from '@/config/webhooks';
import { Trash2, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderFormProps {
  cart: CartItem[];
  onRemoveItem: (index: number) => void;
  onSuccess: (orderId: string) => void;
}

const OrderForm = ({ cart, onRemoveItem, onSuccess }: OrderFormProps) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const selectedGov = governorates.find((g) => g.name === governorate);
  const shippingFee = selectedGov?.shippingFee || 0;
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + shippingFee;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'This field is required';
    if (!phone.trim() || !/^(\+?2)?0[0-9]{10}$/.test(phone.replace(/\s/g, ''))) errs.phone = 'Please enter a valid phone number';
    if (!governorate) errs.governorate = 'This field is required';
    if (!address.trim()) errs.address = 'This field is required';
    if (cart.length === 0) errs.cart = 'Please add at least one item';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: OrderPayload = {
      customer: { name: name.trim(), phone: phone.trim(), governorate, address: address.trim() },
      items: cart.map((c) => ({ name: c.name, size: c.size, quantity: c.quantity, price: c.price })),
      subtotal,
      shippingFee,
      total,
    };

    const orderId = 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    setSubmitting(true);
    try {
      if (WEBHOOKS.POST_ORDER) {
        await fetch(WEBHOOKS.POST_ORDER, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, orderId }),
        });
      }
      onSuccess(orderId);
    } catch {
      onSuccess(orderId);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors';

  return (
    <section id="checkout" className="border-t border-border bg-muted/30 py-6 md:py-10">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="mb-8 text-2xl font-bold text-foreground md:text-3xl font-display">Complete Your Order</h2>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 lg:col-span-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} dir="ltr" />
              {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Governorate</label>
              <select
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
                className={inputClass}
              >
                <option value="">Select governorate...</option>
                {governorates.map((g) => (
                  <option key={g.name} value={g.name}>
                    {g.name} — {g.shippingFee} EGP
                  </option>
                ))}
              </select>
              {errors.governorate && <p className="mt-1 text-xs text-destructive">{errors.governorate}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Full Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                placeholder="Street, building, floor, apartment..."
                className={inputClass}
              />
              {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address}</p>}
            </div>

            {errors.cart && <p className="text-sm font-medium text-destructive">{errors.cart}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-primary py-3.5 text-base font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? '...' : 'Place Order'}
            </button>
          </form>

          {/* Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-lg font-bold text-card-foreground font-display">Order Summary</h3>

              {cart.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                  <ShoppingBag className="h-8 w-8" />
                  <p className="text-sm">Your cart is empty</p>
                </div>
              ) : (
                <div className="mb-4 max-h-60 space-y-3 overflow-y-auto">
                  <AnimatePresence>
                    {cart.map((item, idx) => (
                      <motion.div
                        key={`${item.productId}-${item.size}-${idx}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-3 rounded-lg bg-muted/50 p-2"
                      >
                        <img src={item.image} alt={item.name} className="h-10 w-10 rounded object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.size} × {item.quantity} — {item.price * item.quantity} EGP
                          </p>
                        </div>
                        <button onClick={() => onRemoveItem(idx)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              <div className="space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{subtotal} EGP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">{shippingFee ? `${shippingFee} EGP` : '—'}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-foreground">
                  <span>Grand Total</span>
                  <span className="text-primary">{total} EGP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderForm;
