import {
  FaEnvelope,
  FaFacebookF,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer
      dir="rtl"
      className="flex flex-col items-center gap-16 py-[72px] md:py-[100px] px-6 bg-[#7A7474] text-white"
    >
      {/* קונטיינר ממורכז עם רוחב מקסימלי */}
      <div className="w-full max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {/* עלינו */}
          <div className="md:col-span-1 -mt-5">
            <img
              src="/logoExpress.png"
              alt="Express48"
              className="w-28 h-auto mb-4"
              loading="lazy"
              onClick={() => navigate("/")}
            />

            <p className="space-y-2 text-right">
              החנות שלנו למוצרי חשמל – איכות, שירות ואמינות. מבצעים מיוחדים
              ומשלוחים מהירים לכל רחבי הארץ{" "}
            </p>
            <div className="mt-8 md:col-span-1">
              {/* כפתורי רשתות – ריבוע 36x36, אייקון 16, רקע שקוף (זהה לפוטר) */}
              <div className="flex justify-center gap-6">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="flex w-9 h-9 items-center justify-center rounded-lg text-white hover:bg-white/10 transition"
                >
                  <FaFacebookF size={16} />
                </a>

                <a
                  href="#"
                  aria-label="X (Twitter)"
                  className="flex w-9 h-9 items-center justify-center rounded-lg text-white hover:bg-white/10 transition"
                >
                  <FaXTwitter size={16} />
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="flex w-9 h-9 items-center justify-center rounded-lg text-white hover:bg-white/10 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M11.3334 1.33325H4.66671C2.82576 1.33325 1.33337 2.82564 1.33337 4.66658V11.3333C1.33337 13.1742 2.82576 14.6666 4.66671 14.6666H11.3334C13.1743 14.6666 14.6667 13.1742 14.6667 11.3333V4.66658C14.6667 2.82564 13.1743 1.33325 11.3334 1.33325Z"
                      stroke="white"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10.6667 7.57996C10.7489 8.13479 10.6542 8.70143 10.3958 9.1993C10.1375 9.69717 9.72877 10.1009 9.22776 10.3531C8.72675 10.6052 8.15897 10.693 7.6052 10.6039C7.05143 10.5148 6.53985 10.2533 6.14323 9.85673C5.74662 9.46012 5.48516 8.94854 5.39605 8.39477C5.30694 7.84099 5.39472 7.27322 5.64689 6.77221C5.89907 6.27119 6.3028 5.86245 6.80066 5.60412C7.29853 5.34579 7.86518 5.25102 8.42001 5.33329C8.98596 5.41721 9.50991 5.68093 9.91447 6.08549C10.319 6.49006 10.5828 7.01401 10.6667 7.57996Z"
                      stroke="white"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M11.6666 4.33325H11.6733"
                      stroke="white"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>

                <a
                  href="#"
                  aria-label="YouTube"
                  className="flex w-9 h-9 items-center justify-center rounded-lg text-white hover:bg-white/10 transition"
                >
                  <FaEnvelope size={16} />
                </a>
              </div>
            </div>
          </div>

          {/* קישורים מהירים */}

          <div>
            <h4 className="font-bold mb-4 text-right">שירות ותמיכה</h4>
            <ul className="space-y-2 text-right">
              <li>
                <button
                  onClick={() => navigate("/about")}
                  className="hover:underline"
                >
                  אודותינו
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/support")}
                  className="hover:underline"
                >
                  צור קשר
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/")}
                  className="hover:underline"
                >
                  בלוג
                </button>
              </li>
            </ul>
          </div>

          {/* שירות לקוחות */}
          <div>
            <h4 className="font-bold mb-4 text-right">שרות לקוחות</h4>
            <ul className="space-y-2 text-right">
              <li>
                <button
                  onClick={() => navigate("/terms-of-use")}
                  className="hover:underline"
                >
                  מרכז התמיכה
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/cancellation-policy")}
                  className="hover:underline"
                >
                  מידע על המשלוח
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/returns-policy")}
                  className="hover:underline"
                >
                  החלפות והחזרות
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/warranty-policy")}
                  className="hover:underline"
                >
                  אחריות
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/shipping-policy")}
                  className="hover:underline"
                >
                  מעקב אחר משלוח
                </button>
              </li>
            </ul>
          </div>

          {/* יצירת קשר*/}
          <div>
            <h4 className="font-bold mb-4 text-right">יצירת קשר </h4>
            <ul className="space-y-2 text-right">
              <li>
                <button
                  onClick={() => navigate("/support")}
                  className="hover:underline"
                >
                  צרו איתנו קשר עוד היום
                </button>
              </li>
              <li>
                <h4 className="font-bold mb-4 text-right"> 02-5005050</h4>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <p
        className="text-center text-white text-[14px] leading-5 font-normal"
        style={{ fontFamily: "Arial" }}
      >
        2025 Express 48 All rights reserved ©{" "}
      </p>
    </footer>
  );
};

export default Footer;
