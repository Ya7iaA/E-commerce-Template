export interface AdminUser {
  username: string;
  token?: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  image: string;
  originalPrice: number;
  discountedPrice: number;
  sizes: string;
  inStock: boolean;
}

export interface AdminOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  governorate: string;
  address: string;
  items: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  pendingOrders: number;
  revenueByDay: { date: string; revenue: number }[];
  ordersByGovernorate: { governorate: string; count: number }[];
  topProducts: { name: string; sold: number }[];
  ordersByStatus: { status: string; count: number }[];
}
