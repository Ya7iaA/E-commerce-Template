import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Loader2, Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdminOrder } from "@/types/admin";
import { WEBHOOKS } from "@/config/webhooks";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from "recharts";

const AnalyticsSection = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch(WEBHOOKS.GET_ORDERS),
        fetch(WEBHOOKS.GET_ADMIN_PRODUCTS),
      ]);
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(Array.isArray(data) ? data : []);
      }
      if (productsRes.ok) {
        const data = await productsRes.json();
        setTotalProducts(Array.isArray(data) ? data.length : 0);
      }
    } catch {
      toast({ title: "Error", description: "Failed to load analytics data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activeOrders = useMemo(() => orders.filter(o => o.status !== "cancelled"), [orders]);

  const analytics = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const todayOrders = activeOrders.filter(o => o.createdAt?.slice(0, 10) === todayStr);
    const monthOrders = activeOrders.filter(o => {
      const d = new Date(o.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const revenue = (list: AdminOrder[]) => list.reduce((sum, o) => sum + (o.subtotal || 0), 0);
    const grandTotal = (list: AdminOrder[]) => list.reduce((sum, o) => sum + (o.total || 0), 0);

    return {
      totalProducts,
      ordersToday: todayOrders.length,
      ordersThisMonth: monthOrders.length,
      revenueToday: revenue(todayOrders),
      revenueMonth: revenue(monthOrders),
      grandTotalToday: grandTotal(todayOrders),
      grandTotalMonth: grandTotal(monthOrders),
    };
  }, [activeOrders, totalProducts]);

  // Chart data: orders by status
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach(o => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  }, [orders]);

  // Chart data: revenue last 7 days
  const last7DaysData = useMemo(() => {
    const days: { date: string; revenue: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayOrders = activeOrders.filter(o => o.createdAt?.slice(0, 10) === dateStr);
      days.push({
        date: d.toLocaleDateString("en", { month: "short", day: "numeric" }),
        revenue: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
        orders: dayOrders.length,
      });
    }
    return days;
  }, [activeOrders]);

  // Chart data: orders by governorate (top 5)
  const govData = useMemo(() => {
    const counts: Record<string, number> = {};
    activeOrders.forEach(o => {
      if (o.governorate) counts[o.governorate] = (counts[o.governorate] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([gov, count]) => ({ governorate: gov, count }));
  }, [activeOrders]);

  const PIE_COLORS = [
    "hsl(var(--primary))",
    "hsl(45, 90%, 55%)",
    "hsl(200, 70%, 50%)",
    "hsl(142, 70%, 45%)",
    "hsl(0, 70%, 55%)",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const cards = [
    { title: "Total Products", value: analytics.totalProducts, icon: Package },
    { title: "Orders Today", value: analytics.ordersToday, icon: ShoppingCart },
    { title: "Orders This Month", value: analytics.ordersThisMonth, icon: ShoppingCart },
    { title: "Revenue Today", value: `${analytics.revenueToday} EGP`, icon: DollarSign },
    { title: "Revenue This Month", value: `${analytics.revenueMonth} EGP`, icon: DollarSign },
    { title: "Grand Total Today", value: `${analytics.grandTotalToday} EGP`, icon: TrendingUp },
    { title: "Grand Total This Month", value: `${analytics.grandTotalMonth} EGP`, icon: TrendingUp },
  ];

  const statusChartConfig = {
    count: { label: "Orders", color: "hsl(var(--primary))" },
  };

  const revenueChartConfig = {
    revenue: { label: "Revenue", color: "hsl(var(--primary))" },
    orders: { label: "Orders", color: "hsl(142, 70%, 45%)" },
  };

  const govChartConfig = {
    count: { label: "Orders", color: "hsl(var(--primary))" },
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-display font-semibold">Analytics</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Orders - Last 7 Days */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue - Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-[250px] w-full">
              <LineChart data={last7DaysData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={statusChartConfig} className="h-[250px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="status" />} />
                <Pie data={statusData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={({ status, count }) => `${status}: ${count}`}>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Orders Last 7 Days Bar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders - Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-[250px] w-full">
              <BarChart data={last7DaysData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="orders" fill="hsl(142, 70%, 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Governorates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Governorates</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={govChartConfig} className="h-[250px] w-full">
              <BarChart data={govData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={12} />
                <YAxis dataKey="governorate" type="category" fontSize={12} width={100} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsSection;
