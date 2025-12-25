import { useState } from "react";
import { DEFAULT_REPORT_LIMIT } from "../constants/sellerReports.constants";
import type {
  SellerProductReportQuery,
} from "../types/sellerReports.types";
import { useGetSellerProductReportsQuery } from "../../../../redux/services/sellerReportsApi";

export function useSellerProductReports() {
  const [query, setQuery] = useState<SellerProductReportQuery>({
    page: 1,
    limit: DEFAULT_REPORT_LIMIT,
  });

  const result = useGetSellerProductReportsQuery(query);

  const setDateRange = (from?: string, to?: string) => {
    setQuery((prev) => ({
      ...prev,
      page: 1,
      from,
      to,
    }));
  };

  const setPage = (page: number) => {
    setQuery((prev) => ({ ...prev, page }));
  };

  return {
    query,
    setDateRange,
    setPage,
    ...result,
  };
}
