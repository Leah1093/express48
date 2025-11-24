export type OrderStatus =
  | "pending"
  | "approved"
  | "canceled"
  | "returned"
  | "completed"
  | "paid";


export interface SellerOrderItem {
  productId: string;
  productTitle: string;
  sku?: string;
  variationName?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  thumbnailUrl?: string;
}

export interface SellerOrder {
  id: string;
  orderId: string;
  status: OrderStatus;
  orderDate: string;
  createdAt: string;
  updatedAt: string;

  totalAmount: number;
  discountedAmount?: number | null;

  items: SellerOrderItem[];

  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;

  shippingAddress?: {
    country?: string;
    city?: string;
    street?: string;
    zip?: string;
    notes?: string;
    fullAddress?: string;
  };

  notes?: string;
  receiptUrl?: string | null;
  warrantyText?: string | null;
}

export interface SellerOrdersFilter {
  status?: OrderStatus | "all";
  search?: string;
}

export interface SellerOrderApiItem {
  productId: string;
  quantity: number;
  price: number;
  productSnapshot?: {
    title?: string;
    sku?: string;
    variationName?: string;
    thumbnailUrl?: string;
  };
}

export interface SellerOrderApiResponse {
  _id: string;
  userId?: string;
  address?: {
    country?: string;
    city?: string;
    street?: string;
    zip?: string;
    notes?: string;
    fullAddress?: string;
  } | null;

  totalAmount: number;
  discountedAmount?: number | null;
  notes?: string;
  status: OrderStatus;
  receiptUrl?: string | null;
  warranty?: string | null;
  orderId: string;
  orderDate: string;
  createdAt: string;
  updatedAt: string;

  items: SellerOrderApiItem[];

  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;

    shippingAddress?: {
    country?: string;
    city?: string;
    street?: string;
    zip?: string;
    notes?: string;
    fullAddress?: string;
  };
}
