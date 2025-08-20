import { useSelector } from "react-redux";
import CartItem from "./CartItem";
import {selectCartItems} from "../../../redux/slices/cartSelectors"

const getKey = (item) =>
  item._id ||
  item?.product?._id ||
  (typeof item?.productId === "object" ? item.productId._id : item?.productId);

export default function CartItemsTable({ itemComponent: Item = CartItem}) {
const items = useSelector(selectCartItems);

  if (!items.length) {
    return (
      <div className="rounded-xl border bg-white p-6 text-center text-gray-500">
        העגלה ריקה
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-y-auto">
      {items.map((item) => (
        <Item key={getKey(item)} item={item} />
      ))}
    </div>
  );
}
