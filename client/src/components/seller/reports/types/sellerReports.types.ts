// טיפוס בסיסי לפריט בטבלת הדוחות
export type SellerProductReportItem = {
  productId: string;
  sku: string;
  title: string;
  imageUrl?: string;

  currentStock: number;     // מלאי נוכחי
  soldQuantity: number;     // כמה יחידות נמכרו בטווח הזמן
  totalRevenue: number;     // כמה כסף נכנס על המוצר בטווח הזמן
};

// פירוט למוצר בודד (כשפותחים את השורה)
export type SellerProductReportDetailsItem = {
  date: string;             // ISO string (YYYY-MM-DD)
  orderId: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type SellerProductReportDetails = {
  productId: string;
  items: SellerProductReportDetailsItem[];
};

// תגובה של ה־API לרשימת דוחות
export type SellerProductReportListResponse = {
  items: SellerProductReportItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
};

// פרמטרים לשאילתת הדוח
export type SellerProductReportQuery = {
  from?: string;  // YYYY-MM-DD
  to?: string;    // YYYY-MM-DD
  page?: number;
  limit?: number;
};
