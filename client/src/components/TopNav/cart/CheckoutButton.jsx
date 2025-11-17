// import { useSelector,useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import {fetchAddresses} from "../../../redux/thunks/addressThunks"

// export default function CheckoutButton() {
//   const { user, loading, initialized } = useSelector((state) => state.user);
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const handleCheckoutClick = async () => {
//     if (loading && !initialized) {
//       return; // עדיין טוען מצב משתמש
//     }

//     if (!user) {
//       // ❌ לא מחובר → לעמוד התחברות
//       navigate("/login", { state: { from: "/checkout" } });
//       return;
//     }

//     try {
//     //   // ✅ משתמש מחובר → נבדוק אם יש לו כבר כתובת
//     //   const res = await axios.get("https://api.express48.com/addresses", {
//     //     withCredentials: true,
//     //   });
//       const allAdress = await dispatch(fetchAddresses());

//       if (allAdress> 0) {
//         // יש כתובת שמורה → ישר לדף התשלום
//         navigate("/payment");
//       } else {
//         // אין כתובת → לעמוד הקופה כדי למלא
//         navigate("/checkout");
//       }
//     } catch (err) {
//       console.error("Error checking addresses:", err);
//       // במקרה של שגיאה נשלח ל-checkout כדי לא לחסום את המשתמש
//       navigate("/checkout");
//     }
//   };

//   return (
//     <button
//       type="button"
//       onClick={handleCheckoutClick}
//       disabled={loading && !initialized}
//       className="mt-4 w-full rounded-lg bg-[#0E3556] px-4 py-3 font-semibold text-white hover:brightness-110 active:brightness-95 disabled:opacity-50"
//     >
//       מעבר לתשלום
//     </button>
//   );
// }
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAddresses } from "../../../redux/thunks/addressThunks"; // הנתיב לפי הפרויקט שלך
import { useEffect } from "react";

export default function CheckoutButton() {
  const { user, loading: userLoading, initialized } = useSelector((state) => state.user);
  const { list: addresses, loading: addrLoading } = useSelector((state) => state.addresses);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // אם יש משתמש מחובר – נטען את הכתובות שלו ל־Redux
      dispatch(fetchAddresses());
    }
  }, [user, dispatch]);

  const handleCheckoutClick = () => {
    if (userLoading && !initialized) {
      return; // עדיין לא יודעים מצב משתמש
    }

    if (!user) {
      // ❌ לא מחובר → לעמוד התחברות
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    if (addrLoading) {
      // אם הכתובות עדיין נטענות – אפשר לחסום זמנית
      return;
    }

    if (addresses.length > 0) {
      // ✅ יש כתובת שמורה → ישר לדף התשלום
      navigate("/payment");
    } else {
      // ❌ אין כתובת → לעמוד הקופה כדי למלא
      navigate("/checkout");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCheckoutClick}
      disabled={(userLoading && !initialized) || addrLoading}
      className="mt-4 w-full rounded-lg bg-[#ED6A23] px-4 py-3 font-semibold text-white hover:brightness-110 active:brightness-95 disabled:opacity-50"
    >
      מעבר לתשלום
    </button>
  );
}

