import { useMemo, useCallback } from "react";
import {
  useGetSellerOrdersQuery,
  useUpdateSellerOrderStatusMutation,
} from "../../../../redux/services/sellerOrdersApi";
import type {
  SellerOrder,
  SellerOrdersFilter,
  SellerOrderApiResponse,
  OrderStatus,
} from "../types/sellerOrders.types";
import { mapApiOrderToSellerOrder } from "../utils/sellerOrders.utils";

interface UseSellerOrdersResult {
  orders: SellerOrder[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  changeStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  isUpdatingStatus: boolean;
}

export function useSellerOrders(
  filter: SellerOrdersFilter
): UseSellerOrdersResult {
  const { status = "all", search = "" } = filter;

  // ✅ קריאת ההזמנות
  const { data, isLoading, isError, refetch } =
    useGetSellerOrdersQuery({
      status: status === "all" ? undefined : status,
      search: search || undefined,
    });

  // ✅ מוטציה לעדכון סטטוס
  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateSellerOrderStatusMutation();

  const orders: SellerOrder[] = useMemo(() => {
    if (!data) return [];
    return (data as SellerOrderApiResponse[]).map(
      mapApiOrderToSellerOrder
    );
  }, [data]);

  const changeStatus = useCallback(
    async (orderId: string, newStatus: OrderStatus) => {
      try {
        await updateStatus({ orderId, status: newStatus }).unwrap();
        // אין צורך לקרוא refetch ידנית כי יש invalidatesTags,
        // אבל אם תרצי רענון אגרסיבי:
        // await refetch();
      } catch (err) {
        console.error("❌ שגיאה בעדכון סטטוס הזמנה:", err);
      }
    },
    [updateStatus]
  );

  return {
    orders,
    isLoading,
    isError,
    refetch,
    changeStatus,
    isUpdatingStatus,
  };
}
