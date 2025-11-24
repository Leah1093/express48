import type { FC } from "react";
import type { OrderStatus } from "../types/sellerOrders.types";
import { getStatusBadgeClasses } from "../utils/sellerOrders.utils";

interface Props {
  status: OrderStatus;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "ממתין לטיפול",
  approved: "אושרה",
  canceled: "בוטלה",
  returned: "הוחזרה",
  completed: "הושלמה",
  paid: "שולם",
};

export const SellerOrderStatusBadge: FC<Props> = ({ status }) => {
  return (
    <span className={getStatusBadgeClasses(status)}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
};
