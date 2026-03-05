import { useState } from 'react';
import { Search, X, Send, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WEBHOOKS } from '@/config/webhooks';

interface TrackingMessage {
  id: number;
  type: 'user' | 'bot';
  text: string;
}

const OrderTracker = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<TrackingMessage[]>([
    { id: 0, type: 'bot', text: 'Hi! Paste your Order ID here to track your order.' },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: TrackingMessage = { id: Date.now(), type: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      if (WEBHOOKS.TRACK_ORDER) {
        const res = await fetch(WEBHOOKS.TRACK_ORDER, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: trimmed }),
        });
        const data = await res.json();
        const status = data?.status || data?.message || 'No information found for this order.';
        setMessages((prev) => [...prev, { id: Date.now() + 1, type: 'bot', text: String(status) }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, type: 'bot', text: 'Tracking is not configured yet. Please contact us via WhatsApp.' },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, type: 'bot', text: 'Something went wrong. Please try again later.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((p) => !p)}
        aria-label="Track your order"
        className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 active:scale-95"
      >
        {open ? <X size={24} /> : <Search size={24} />}
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-36 left-4 right-4 md:bottom-24 md:left-6 md:right-auto z-50 flex w-auto md:w-80 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center gap-2 bg-primary px-4 py-3">
              <Package size={20} className="text-primary-foreground" />
              <span className="font-display text-sm font-bold tracking-wide text-primary-foreground">
                Track Your Order
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-2 overflow-y-auto p-3" style={{ maxHeight: 280 }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${msg.type === 'bot'
                      ? 'bg-muted text-foreground'
                      : 'ml-auto bg-primary text-primary-foreground'
                    }`}
                >
                  {msg.text}
                </div>
              ))}
              {loading && (
                <div className="max-w-[85%] rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                  Looking up your order...
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 border-t border-border p-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your Order ID..."
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default OrderTracker;
