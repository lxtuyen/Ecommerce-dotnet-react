export type UserRole = 'Customer' | 'Admin';

export interface User {
  id: number;
  name: string;
  email: string;
  initials: string;
  role: UserRole;
  token?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  image?: string;
  icon?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  rating: number;
  stockQuantity: number;
  categoryId: number;
  categoryName?: string;
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stockQuantity?: number;
}

export interface OrderItem {
  id?: number;
  productId: number;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export interface Order {
  id: number;
  userId?: number;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  phoneNumber: string;
  paymentMethod: string;
  paymentStatus?: PaymentStatus;
  paymentIntentId?: string;
  shippingFee?: number;
  status: OrderStatus;
  totalAmount: number;
  notes?: string;
  createdDateTime: string;
  orderItems: OrderItem[];
}

export interface CreateOrderPayload {
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  phoneNumber: string;
  paymentMethod: string;
  paymentIntentId?: string;
  shippingFee?: number;
  notes?: string;
  items: {
    productId: number;
    productName: string;
    productImage?: string;
    price: number;
    quantity: number;
  }[];
}

export interface PaymentIntentPayload {
  items: { productId: number; quantity: number }[];
  customerEmail?: string;
  customerName?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  publishableKey: string;
  amount: number;
  currency: string;
  subtotal: number;
  shippingFee: number;
}

export interface StripeConfigResponse {
  publishableKey: string;
}

export interface ServiceResponse<T> {
  data: T;
  success: boolean;
  message: string;
}
