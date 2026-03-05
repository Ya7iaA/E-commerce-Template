export interface Product {
  id: string;
  name: string;
  image: string;
  originalPrice: number;
  discountedPrice: number;
  sizes: string[];
  inStock?: boolean;
}

export interface CartItem {
  productId: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Governorate {
  name: string;
  shippingFee: number;
}

export interface OrderPayload {
  customer: {
    name: string;
    phone: string;
    governorate: string;
    address: string;
  };
  items: {
    name: string;
    size: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  shippingFee: number;
  total: number;
}
