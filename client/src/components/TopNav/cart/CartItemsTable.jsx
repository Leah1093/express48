import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import CartItem from "./CartItem";
import {selectCartItems} from "../../../redux/slices/cartSelectors"

// const getKey = (item) =>
//   item._id ||
//   item?.product?._id ||
//   (typeof item?.productId === "object" ? item.productId._id : item?.productId);
const getKey = (item) => {
  const productId = item.productId?._id?.toString?.() || item.productId?.toString?.();
  const variationId = item.variationId?.toString?.() || "no-variation";
  return `${productId}-${variationId}`;
};


export default function CartItemsTable({ itemComponent: Item = CartItem, onSelectedItemsChange }) {
  const items = useSelector(selectCartItems);
  const [selectedItems, setSelectedItems] = useState(() => {
    // אתחול - כל המוצרים מסומנים בברירת מחדל
    const initial = {};
    items.forEach(item => {
      const itemId = item._id || item.productId?._id || item.productId;
      initial[itemId] = true;
    });
    return initial;
  });

  const handleSelectionChange = useCallback((itemId, isSelected) => {
    setSelectedItems(prev => {
      const newSelected = { ...prev, [itemId]: isSelected };
      
      // עדכון ההורה
      if (onSelectedItemsChange) {
        const selectedIds = Object.keys(newSelected).filter(id => newSelected[id]);
        onSelectedItemsChange(selectedIds, newSelected);
      }
      
      return newSelected;
    });
  }, [onSelectedItemsChange]);

  if (!items.length) {
    return null;
  }

  return (
    <div>
      {items.map((item) => (
        <Item 
          key={getKey(item)} 
          item={item} 
          onSelectionChange={handleSelectionChange}
        />
      ))}
    </div>
  );
}
