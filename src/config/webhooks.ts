// Centralized webhook configuration — uses env vars with hardcoded fallbacks
export const WEBHOOKS = {
  // Storefront
  GET_PRODUCTS: import.meta.env.VITE_WEBHOOK_GET_PRODUCTS || 'https://engine.ya7iaahmed.com/webhook/lubbgo/products',
  POST_ORDER: import.meta.env.VITE_WEBHOOK_POST_ORDER || 'https://engine.ya7iaahmed.com/webhook/lubbgo/orders',

  // Admin
  LOGIN: import.meta.env.VITE_WEBHOOK_LOGIN || 'https://engine.ya7iaahmed.com/webhook/luubgo/admin/login',
  GET_ADMIN_PRODUCTS: import.meta.env.VITE_WEBHOOK_GET_ADMIN_PRODUCTS || 'https://engine.ya7iaahmed.com/webhook/lubbgo/admin/products',
  ADD_PRODUCT: import.meta.env.VITE_WEBHOOK_ADD_PRODUCT || 'https://engine.ya7iaahmed.com/webhook/lubbgo/admin/product/add',
  UPDATE_PRODUCT: import.meta.env.VITE_WEBHOOK_UPDATE_PRODUCT || 'https://engine.ya7iaahmed.com/webhook/lubbgo/admin/product/update',
  DELETE_PRODUCT: import.meta.env.VITE_WEBHOOK_DELETE_PRODUCT || 'https://engine.ya7iaahmed.com/webhook/lubbgo/admin/product/delete',
  GET_ORDERS: import.meta.env.VITE_WEBHOOK_GET_ORDERS || 'https://engine.ya7iaahmed.com/webhook/lubbgo/admin/orders',
  UPDATE_ORDER_STATUS: import.meta.env.VITE_WEBHOOK_UPDATE_ORDER_STATUS || 'https://engine.ya7iaahmed.com/webhook/lubbgo/admin/order/update',
  TRACK_ORDER: import.meta.env.VITE_WEBHOOK_TRACK_ORDER || 'https://engine.ya7iaahmed.com/webhook/lubbgo/admin/order/track',
} as const;