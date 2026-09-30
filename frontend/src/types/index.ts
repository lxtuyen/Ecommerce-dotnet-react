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
  reviewCount?: number;
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
  couponCode?: string;
  discountAmount?: number;
  status: OrderStatus;
  totalAmount: number;
  notes?: string;
  cancelReason?: string;
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
  couponCode?: string;
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
  couponCode?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  publishableKey: string;
  amount: number;
  currency: string;
  subtotal: number;
  discountAmount?: number;
  shippingFee: number;
}

export interface StripeConfigResponse {
  publishableKey: string;
}

export interface CouponValidationResult {
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  minOrderAmount: number;
  isValid: boolean;
  message: string;
}

export interface Coupon {
  id: number;
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  expiryDate?: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

export interface ServiceResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

export interface Review {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface ProductReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  reviews: Review[];
  canReview: boolean;
  hasReviewed: boolean;
  isVerifiedBuyer: boolean;
}

export interface CreateReviewRequest {
  rating: number;
  title: string;
  comment: string;
}

export interface UserAddress {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  zipCode: string;
  label: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateAddressPayload {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  zipCode: string;
  label?: string;
  isDefault?: boolean;
}

