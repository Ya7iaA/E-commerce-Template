import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Check, X, MessageCircle, Printer, Trash2, Search, ChevronDown, CalendarDays } from "lucide-react";
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
      <title>Order #${order.id}</title>
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
        <h1>Order #${order.id}</h1>
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
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
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
    const orderDate = new Date(o.createdAt);
    const matchesDateFrom = !dateFrom || orderDate >= new Date(dateFrom);
    const matchesDateTo = !dateTo || orderDate <= new Date(dateTo + "T23:59:59");
    return matchesStatus && matchesSearch && matchesDateFrom && matchesDateTo;
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

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setSaving(true);
    try {
      const res = await fetch(WEBHOOKS.UPDATE_ORDER_STATUS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Success", description: "Order status updated" });
      fetchOrders();
    } catch {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-display font-black uppercase text-foreground">Orders</h1>
        <p className="text-sm text-muted-foreground">{orders.length} total orders</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 md:mb-8">
        <div className="relative w-full sm:w-auto sm:min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID or name..."
            className="w-full bg-card border border-border rounded-md pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-card border border-border rounded-md pl-8 pr-2 py-2.5 text-xs text-foreground focus:ring-1 focus:ring-primary outline-none"
              title="From date"
            />
          </div>
          <span className="text-xs text-muted-foreground">to</span>
          <div className="relative">
            <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-card border border-border rounded-md pl-8 pr-2 py-2.5 text-xs text-foreground focus:ring-1 focus:ring-primary outline-none"
              title="To date"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(""); setDateTo(""); }}
              className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground text-xs"
              title="Clear dates"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3.5 py-2 text-xs font-medium rounded-md border transition-colors capitalize ${
                filterStatus === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "all" ? "All" : s}
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
        <div className="space-y-4">
          <AnimatePresence>
            {filteredOrders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card border border-border rounded-xl p-4 md:p-6"
              >
                {/* Top row: ID + status badge + actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-display font-bold text-sm text-foreground">
                      {order.id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${STATUS_COLORS[order.status] || ""}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="relative">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={saving}
                        className="appearance-none bg-secondary border border-border rounded-md pl-3 pr-7 py-1.5 text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                    </div>
                    <button
                      onClick={() => handlePrintOrder(order)}
                      className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                      title="Print"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                    <a
                      href={`https://wa.me/+2${order.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        'رقم الاوردر ' + order.id + '\n' +
                        'الاسم: ' + order.customerName + '\n' +
                        'الحالة: ' + order.status + '\n' +
                        'العنوان: ' + order.governorate + ' - ' + order.address + '\n' +
                        'المنتجات:\n' + order.items + '\n' +
                        'المجموع: ' + order.total + ' EGP'
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-md hover:bg-emerald-500/10 text-emerald-400 transition-colors"
                      title="WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>

                {/* Body: two columns on desktop, stacked on mobile */}
                <div className="flex flex-col md:flex-row md:gap-8">
                  {/* Left: Customer info */}
                  <div className="space-y-1 mb-4 md:mb-0 md:min-w-[220px]">
                    <p className="font-semibold text-sm text-foreground">{order.customerName}</p>
                    <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.governorate} — {order.address}
                    </p>
                  </div>

                  {/* Right: Items + totals */}
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{order.items}</p>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground">
                        Subtotal: {order.subtotal} | Shipping: {order.shippingFee}
                      </span>
                      <span className="font-bold text-sm text-primary">
                        {order.total} EGP
                      </span>
                    </div>
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
