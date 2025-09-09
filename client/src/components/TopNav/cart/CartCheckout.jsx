import React from "react";
import AddressForm from "./AddressForm"
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchAddresses } from "../../../redux/thunks/addressThunks";

const handleAddressSaved = (newAddress) => 
  { console.log("הכתובת נשמרה:", newAddress); 
    // אפשר לשמור ב־Redux, או לטעון מחדש את הכתובות };
  }

export default function CartCheckout() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchAddresses()); // מושך את הכתובות מהשרת ושומר ב־Redux
  }, [dispatch]);
  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* עמודת ימין – הודעות + פרטי חיוב */}
          <section className="order-1 lg:order-none">
            {/* שורת הודעות עליונה */}
            <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 text-sm">
                <p className="leading-6">
                  <span className="font-medium">קנית כאן בעבר?</span>{" "}
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    יש ללחוץ כאן כדי להתחבר
                  </a>
                </p>
                <p className="leading-6">
                  <span className="font-medium">יש לך קופון?</span>{" "}
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    לחצו כאן כדי להזין את קוד הקופון
                  </a>
                </p>
              </div>
            </div>

            {/* כרטיס פרטי חיוב */}
            <AddressForm onSuccess={handleAddressSaved}></AddressForm>
          </section>

          {/* עמודת שמאל – אפשר לשלב כאן “הזמנה שלך” (רשימת פריטים/סיכום) בעתיד */}
          <aside className="hidden lg:block">
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-gray-500">
              {/* השארתי ריק בכוונה כדי להתמקד בבקשה: “פרטי חיוב” והחלק העליון */}
              {/* כאן אפשר להכניס את ההזמנה שלך / סכום ביניים וכו' */}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
