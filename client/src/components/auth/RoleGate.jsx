import { useSelector } from "react-redux";
import { selectRole } from "../../redux/slices/userSelectors";

/**
 * שימוש:
 * <RoleGate allow={["seller", "admin"]} fallback={null}>
 *   <Button>הוסף מוצר</Button>
 * </RoleGate>
 */
export default function RoleGate({ allow = [], fallback = null, children }) {
  const role = useSelector(selectRole);
  const ok = allow.length === 0 ? true : allow.includes(role);
  return ok ? <>{children}</> : fallback;
}
