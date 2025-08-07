import React from "react";
import { useDispatch , useSelector } from "react-redux";
import { addItemAsync } from "../../redux/thunks/cartThunks"; 
import {addGuestItem} from "../../redux/slices/guestCartSlice";


function ProductCard({ product }) {

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const handleAddToCart = () => {
    console.log("product._id:", product._id); 
    if(user){
      dispatch(addItemAsync(product));
    }else{
      dispatch(addGuestItem(product));
    }
    
  };

  return (
    <div style={styles.card}>
      {/* תגית NEW */}
      <div style={styles.newTag}>NEW</div>

      {/* תמונה */}
      <img src={product.image} alt={product.title} style={styles.image} />

      {/* שם מוצר */}
      <div style={styles.title}>
        {product.title}
      </div>

      {/* מחיר */}
      <div style={styles.price}>{product.price} ₪</div>

      {/* צבעים מדומים */}
      <div style={styles.colors}>
        <span style={{ ...styles.circle, backgroundColor: "#d6b1d8" }} />
        <span style={{ ...styles.circle, backgroundColor: "#000" }} />
        <span style={{ ...styles.circle, backgroundColor: "#fff", border: "1px solid #ccc" }} />
      </div>

      {/* כפתור */}
      <button style={styles.button} onClick={handleAddToCart}>בחר אפשרויות</button>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 0 8px rgba(0,0,0,0.1)",
    padding: "16px",
    textAlign: "center",
    position: "relative",
    width: "250px",
  },
  newTag: {
    position: "absolute",
    top: "10px",
    left: "10px",
    backgroundColor: "green",
    color: "white",
    padding: "2px 8px",
    borderRadius: "9999px",
    fontSize: "12px",
  },
  image: {
    width: "120px",
    height: "120px",
    objectFit: "contain",
    margin: "auto",
  },
  title: {
    marginTop: "12px",
    fontWeight: "bold",
    fontSize: "14px",
  },
  price: {
    color: "#0d2d52",
    fontWeight: "bold",
    fontSize: "16px",
    margin: "10px 0",
  },
  colors: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    marginBottom: "12px",
  },
  circle: {
    width: "16px",
    height: "16px",
    borderRadius: "50%",
  },
  button: {
    backgroundColor: "#0d2d52",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "8px 12px",
    cursor: "pointer",
  },
};

export default ProductCard;
