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

export interface Order {
  id: number;
  userId?: number;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  phoneNumber: string;
  paymentMethod: string;
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
  notes?: string;
  items: {
    productId: number;
    productName: string;
    productImage?: string;
    price: number;
    quantity: number;
  }[];
}

export interface ServiceResponse<T> {
  data: T;
  success: boolean;
  message: string;
}
