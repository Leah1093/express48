export type PaymentStatus = "pending" | "paid" | "failed" | "canceled";

export interface CreateCheckoutRequest {
  orderId: string;
  amount: number;
}

export interface CreateCheckoutResponse {
  paymentUrl: string;
  transactionId?: string;
  returnValue: string;
}

export interface FetchResultResponse {
  status: PaymentStatus;
  result: unknown;
}

export interface PayButtonProps {
  orderId: string;
  amount: number;
}
