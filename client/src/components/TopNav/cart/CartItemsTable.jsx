import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import CartItem from "./CartItem";
import { selectCartItems } from "../../../redux/slices/cartSelectors";

const getKey = (item) => {
  const productId = item.productId?._id?.toString?.() || item.productId?.toString?.();
  const variationId = item.variationId?.toString?.() || "no-variation";
  return `${productId}-${variationId}`;
};

export default function CartItemsTable({ onSelectedItemsChange }) {
  const items = useSelector(selectCartItems);
  const [_selectedItems, setSelectedItems] = useState(() => {
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
        <CartItem 
          key={getKey(item)} 
          item={item} 
          onSelectionChange={handleSelectionChange}
        />
      ))}
    </div>
  );
}
