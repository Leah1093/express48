import type {
  SellerOrder,
  SellerOrderApiResponse,
  SellerOrderItem,
  OrderStatus,
} from "../types/sellerOrders.types";
import { ORDER_STATUS_COLORS } from "../constants/sellerOrders.constants";

export function formatPriceIls(amount: number): string {
  if (Number.isNaN(amount)) return "₪0";
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatOrderDate(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.valueOf())) return "";
  return d.toLocaleString("he-IL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusBadgeClasses(status: OrderStatus): string {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium";
  const extra =
    ORDER_STATUS_COLORS[status] ??
    "bg-slate-100 text-slate-800 border-slate-200";
  return `${base} ${extra}`;
}

export function mapApiOrderToSellerOrder(
  api: SellerOrderApiResponse
): SellerOrder {
  const items: SellerOrderItem[] = (api.items || []).map((it) => {
    const snap = it.productSnapshot || {};
    const title =
      snap.title ??
      `מוצר ${it.productId.slice(-6)}`;

    return {
      productId: it.productId,
      productTitle: title,
      sku: snap.sku,
      variationName: snap.variationName,
      quantity: it.quantity,
      unitPrice: it.price,
      lineTotal: it.price * it.quantity,
      thumbnailUrl: snap.thumbnailUrl,
    };
  });

  return {
    id: api._id,
    orderId: api.orderId,
    status: api.status,
    orderDate: api.orderDate ?? api.createdAt,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
    totalAmount: api.totalAmount,
    discountedAmount: api.discountedAmount ?? undefined,
    items,
    buyerName: api.buyerName,
    buyerEmail: api.buyerEmail,
    buyerPhone: api.buyerPhone,
    shippingAddress: api.address
      ? {
          country: api.address.country,
          city: api.address.city,
          street: api.address.street,
          zip: api.address.zip,
          notes: api.address.notes,
          fullAddress: api.address.fullAddress,
        }
      : undefined,
    notes: api.notes,
    receiptUrl: api.receiptUrl ?? undefined,
    warrantyText: api.warranty ?? undefined,
  };
}

export function getOrderAddressLine(order: SellerOrder): string {
  // קודם מנסים לקחת את הכתובת הממופה
  const addr =
    order.shippingAddress ||
    // גיבוי – אם בטעות יש עדיין address ישירות על האוביקט
    (order as any).address ||
    null;

  if (!addr) return "";

  if (addr.fullAddress) {
    return addr.fullAddress;
  }

  const parts = [addr.street, addr.city, addr.zip].filter(Boolean);
  return parts.join(", ");
}

