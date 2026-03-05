import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Pencil, Check, X, MessageCircle, Printer, Trash2, Search, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdminOrder } from "@/types/admin";
import { WEBHOOKS } from "@/config/webhooks";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-400",
  confirmed: "bg-blue-500/15 text-blue-400",
  shipped: "bg-purple-500/15 text-purple-400",
  delivered: "bg-emerald-500/15 text-emerald-400",
  cancelled: "bg-red-500/15 text-red-400",
};

const STATUS_OPTIONS: AdminOrder["status"][] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const handlePrintOrder = (order: AdminOrder) => {
  const printWindow = window.open("", "_blank", "width=400,height=600");
  if (!printWindow) return;
  printWindow.document.write(`
    <html>
    <head>
      <title>Order #${order.id.slice(0, 8)}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 24px; color: #1a1a1a; font-size: 13px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 12px; }
        .header h1 { font-size: 18px; margin-bottom: 4px; }
        .header p { font-size: 11px; color: #666; }
        .section { margin-bottom: 14px; }
        .section-title { font-weight: 700; font-size: 12px; text-transform: uppercase; color: #555; margin-bottom: 6px; letter-spacing: 0.5px; }
        .row { display: flex; justify-content: space-between; padding: 3px 0; }
        .label { color: #666; }
        .value { font-weight: 500; text-align: right; max-width: 60%; }
        .items { white-space: pre-wrap; line-height: 1.5; margin-top: 4px; }
        .divider { border-top: 1px dashed #ccc; margin: 12px 0; }
        .total-row { font-size: 15px; font-weight: 700; }
        .status { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: capitalize; background: #e8e8e8; }
        @media print { body { padding: 12px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Order #${order.id.slice(0, 8)}</h1>
        <p>${new Date(order.createdAt).toLocaleString()}</p>
      </div>
      <div class="section">
        <div class="section-title">Customer Info</div>
        <div class="row"><span class="label">Name</span><span class="value">${order.customerName}</span></div>
        <div class="row"><span class="label">Phone</span><span class="value">${order.customerPhone}</span></div>
        <div class="row"><span class="label">Governorate</span><span class="value">${order.governorate}</span></div>
        <div class="row"><span class="label">Address</span><span class="value">${order.address}</span></div>
      </div>
      <div class="divider"></div>
      <div class="section">
        <div class="section-title">Items</div>
        <div class="items">${order.items}</div>
      </div>
      <div class="divider"></div>
      <div class="section">
        <div class="row"><span class="label">Subtotal</span><span class="value">${order.subtotal} EGP</span></div>
        <div class="row"><span class="label">Shipping</span><span class="value">${order.shippingFee} EGP</span></div>
        <div class="row total-row"><span>Total</span><span>${order.total} EGP</span></div>
      </div>
      <div class="divider"></div>
      <div class="section" style="text-align:center;">
        <span class="status">${order.status}</span>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};

const OrdersManager = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(WEBHOOKS.GET_ORDERS);
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch {
      toast({ title: "Error", description: "Failed to load orders", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = filterStatus === "all" || o.status === filterStatus;
    const matchesSearch =
      !searchQuery ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const handleEditStatus = (order: AdminOrder) => {
    setEditingOrderId(order.id);
    setEditStatus(order.status);
  };

  const handleSaveStatus = async (orderId: string) => {
    setSaving(true);
    try {
      const res = await fetch(WEBHOOKS.UPDATE_ORDER_STATUS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: editStatus }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Success", description: "Order status updated" });
      setEditingOrderId(null);
      fetchOrders();
    } catch {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-2 md:p-4">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-display font-black uppercase text-foreground">Orders</h2>
        <p className="text-sm text-muted-foreground">{orders.length} total orders</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, name or phone..."
            className="w-full bg-card border border-border rounded-md pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
              filterStatus === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors capitalize ${
                filterStatus === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">No orders found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AnimatePresence>
            {filteredOrders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card border border-border rounded-xl p-4 space-y-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">#{order.id.slice(0, 8)}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Customer info */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer</span>
                    <span className="font-medium text-foreground">{order.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="text-foreground">{order.customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Governorate</span>
                    <span className="text-foreground">{order.governorate}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Address</span>
                    <p className="mt-0.5 break-words text-foreground">{order.address}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Items</span>
                    <p className="mt-0.5 break-words whitespace-pre-wrap text-foreground">{order.items}</p>
                  </div>
                </div>

                {/* Totals */}
                <div className="flex items-center justify-between pt-2 border-t border-border text-sm">
                  <div className="space-y-0.5">
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>Subtotal: <span className="text-foreground">{order.subtotal} EGP</span></span>
                      <span>Shipping: <span className="text-foreground">{order.shippingFee} EGP</span></span>
                    </div>
                    <div className="font-semibold text-primary">Total: {order.total} EGP</div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  {editingOrderId === order.id ? (
                    <div className="relative">
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="appearance-none bg-secondary border border-border rounded-md pl-3 pr-8 py-1.5 text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-primary"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                    </div>
                  ) : (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[order.status] || ""}`}>
                      {order.status}
                    </span>
                  )}

                  <div className="flex gap-1 items-center">
                    {editingOrderId === order.id ? (
                      <>
                        <button
                          onClick={() => handleSaveStatus(order.id)}
                          disabled={saving}
                          className="p-1.5 rounded-md hover:bg-emerald-500/10 text-emerald-400 transition-colors"
                          title="Save"
                        >
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => setEditingOrderId(null)}
                          className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEditStatus(order)}
                        className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                        title="Edit Status"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handlePrintOrder(order)}
                      className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                      title="Print"
                    >
                      <Printer className="h-3.5 w-3.5" />
                    </button>
                    <a
                      href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `الاسم: ${order.customerName}\nالمحافظة: ${order.governorate}\nالعنوان: ${order.address}\n\nالمنتجات:\n${order.items}\n\nالاجمالي: ${order.total} EGP\n\nتم تأكيد طلبك.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-md hover:bg-emerald-500/10 text-emerald-400 transition-colors"
                      title="WhatsApp"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default OrdersManager;
