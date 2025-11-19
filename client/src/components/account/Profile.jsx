import Orders from "./Orders";
import Favorites from "./Favorites";
import Support from "./Support"; // תדאגי שיש קובץ כזה
import PolicySecurity from "./PolicySecurity";
import CustomerService from "./CustomerService";

export default function Profile() {
  return (
    <div className="space-y-10">
      {/* כותרת הפרופיל */}

      {/* ההזמנות שלי */}
      <section>
        <Orders />
      </section>

      {/* המועדפים שלי */}
      <section>
        <Favorites />
      </section>

      {/* שירות לקוחות */}
      <section>
        <CustomerService />
      </section>
    </div>
  );
}
