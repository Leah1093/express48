import {
  FaEnvelope,
  FaFacebookF,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

function MobileFooterBar() {
  const navigate = useNavigate();

  const baseBtnClass =
    "flex items-center justify-center active:scale-90 transition-transform duration-100";

  return (
    <div
      dir="rtl"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-transparent pb-2"
    >
      <div className="w-full px-4 flex items-center justify-center">
        <div
          className="
            w-full h-[72.5px]
            rounded-[15.105px]
            bg-white
            shadow-[0_-2px_4px_rgba(143,143,143,0.25)]
            flex items-center justify-evenly
          "
        >
          {/* בית */}
          <button
            type="button"
            onClick={() => navigate("/")}
            aria-label="דף הבית"
            className={baseBtnClass}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="21"
              height="20"
              viewBox="0 0 21 20"
              fill="none"
            >
              <path
                d="M0.75 10.0343L9.704 1.07925C10.144 0.64025 10.856 0.64025 11.295 1.07925L20.25 10.0343M3 7.78425V17.9093C3 18.5303 3.504 19.0343 4.125 19.0343H8.25V14.1593C8.25 13.5383 8.754 13.0343 9.375 13.0343H11.625C12.246 13.0343 12.75 13.5383 12.75 14.1593V19.0343H16.875C17.496 19.0343 18 18.5303 18 17.9093V7.78425M6.75 19.0343H15"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* איזור אישי */}
          <button
            type="button"
            onClick={() => navigate("/account")} // להתאים לראוט האמיתי שלך
            aria-label="אזור אישי"
            className={baseBtnClass}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M15.75 6C15.75 6.99456 15.3549 7.94839 14.6517 8.65165C13.9484 9.35491 12.9946 9.75 12 9.75C11.0054 9.75 10.0516 9.35491 9.34836 8.65165C8.6451 7.94839 8.25001 6.99456 8.25001 6C8.25001 5.00544 8.6451 4.05161 9.34836 3.34835C10.0516 2.64509 11.0054 2.25 12 2.25C12.9946 2.25 13.9484 2.64509 14.6517 3.34835C15.3549 4.05161 15.75 5.00544 15.75 6ZM4.50101 20.118C4.53314 18.1504 5.33735 16.2742 6.74018 14.894C8.14302 13.5139 10.0321 12.7405 12 12.7405C13.9679 12.7405 15.857 13.5139 17.2598 14.894C18.6627 16.2742 19.4669 18.1504 19.499 20.118C17.1464 21.1968 14.5882 21.7535 12 21.75C9.32401 21.75 6.78401 21.166 4.50101 20.118Z"
                stroke="#141414"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15.75 6C15.75 6.99456 15.3549 7.94839 14.6517 8.65165C13.9484 9.35491 12.9946 9.75 12 9.75C11.0054 9.75 10.0516 9.35491 9.34836 8.65165C8.6451 7.94839 8.25001 6.99456 8.25001 6C8.25001 5.00544 8.6451 4.05161 9.34836 3.34835C10.0516 2.64509 11.0054 2.25 12 2.25C12.9946 2.25 13.9484 2.64509 14.6517 3.34835C15.3549 4.05161 15.75 5.00544 15.75 6ZM4.50101 20.118C4.53314 18.1504 5.33735 16.2742 6.74018 14.894C8.14302 13.5139 10.0321 12.7405 12 12.7405C13.9679 12.7405 15.857 13.5139 17.2598 14.894C18.6627 16.2742 19.4669 18.1504 19.499 20.118C17.1464 21.1968 14.5882 21.7535 12 21.75C9.32401 21.75 6.78401 21.166 4.50101 20.118Z"
                stroke="black"
                strokeOpacity="0.2"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* מועדפים */}
          <button
            type="button"
            onClick={() => navigate("/favorites")} // להתאים לראוט שלך אם שונה
            aria-label="מועדפים"
            className={baseBtnClass}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="18"
              viewBox="0 0 20 18"
              fill="none"
            >
              <path
                d="M18.75 5.25C18.75 2.765 16.651 0.75 14.062 0.75C12.127 0.75 10.465 1.876 9.75 3.483C9.035 1.876 7.373 0.75 5.437 0.75C2.85 0.75 0.75 2.765 0.75 5.25C0.75 12.47 9.75 17.25 9.75 17.25C9.75 17.25 18.75 12.47 18.75 5.25Z"
                stroke="#101010"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* עגלת קניות */}
          <button
            type="button"
            onClick={() => navigate("/cart")} // להתאים לראוט העגלה אצלך
            aria-label="עגלת קניות"
            className={baseBtnClass}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="21"
              height="20"
              viewBox="0 0 21 20"
              fill="none"
            >
              <path
                d="M0.75 0.75H2.136C2.646 0.75 3.091 1.093 3.223 1.585L3.606 3.022M3.606 3.022C9.17664 2.86589 14.7419 3.48515 20.142 4.862C19.318 7.316 18.339 9.7 17.218 12H6M3.606 3.022L6 12M6 12C5.20435 12 4.44129 12.3161 3.87868 12.8787C3.31607 13.4413 3 14.2044 3 15H18.75M4.5 18C4.5 18.1989 4.42098 18.3897 4.28033 18.5303C4.13968 18.671 3.94891 18.75 3.75 18.75C3.55109 18.75 3.36032 18.671 3.21967 18.5303C3.07902 18.3897 3 18.1989 3 18C3 17.8011 3.07902 17.6103 3.21967 17.4697C3.36032 17.329 3.55109 17.25 3.75 17.25C3.94891 17.25 4.13968 17.329 4.28033 17.4697C4.42098 17.6103 4.5 17.8011 4.5 18ZM17.25 18C17.25 18.1989 17.171 18.3897 17.0303 18.5303C16.8897 18.671 16.6989 18.75 16.5 18.75C16.3011 18.75 16.1103 18.671 15.9697 18.5303C15.829 18.3897 15.75 18.1989 15.75 18C15.75 17.8011 15.829 17.6103 15.9697 17.4697C16.1103 17.329 16.3011 17.25 16.5 17.25C16.6989 17.25 16.8897 17.329 17.0303 17.4697C17.171 17.6103 17.25 17.8011 17.25 18Z"
                stroke="#141414"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M0.75 0.75H2.136C2.646 0.75 3.091 1.093 3.223 1.585L3.606 3.022M3.606 3.022C9.17664 2.86589 14.7419 3.48515 20.142 4.862C19.318 7.316 18.339 9.7 17.218 12H6M3.606 3.022L6 12M6 12C5.20435 12 4.44129 12.3161 3.87868 12.8787C3.31607 13.4413 3 14.2044 3 15H18.75M4.5 18C4.5 18.1989 4.42098 18.3897 4.28033 18.5303C4.13968 18.671 3.94891 18.75 3.75 18.75C3.55109 18.75 3.36032 18.671 3.21967 18.5303C3.07902 18.3897 3 18.1989 3 18C3 17.8011 3.07902 17.6103 3.21967 17.4697C3.36032 17.329 3.55109 17.25 3.75 17.25C3.94891 17.25 4.13968 17.329 4.28033 17.4697C4.42098 17.6103 4.5 17.8011 4.5 18ZM17.25 18C17.25 18.1989 17.171 18.3897 17.0303 18.5303C16.8897 18.671 16.6989 18.75 16.5 18.75C16.3011 18.75 16.1103 18.671 15.9697 18.5303C15.829 18.3897 15.75 18.1989 15.75 18C15.75 17.8011 15.829 17.6103 15.9697 17.4697C16.1103 17.329 16.3011 17.25 16.5 17.25C16.6989 17.25 16.8897 17.329 17.0303 17.4697C17.171 17.6103 17.25 17.8011 17.25 18Z"
                stroke="black"
                strokeOpacity="0.2"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

const Footer = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* פוטר גדול - רק מדסקטופ ומעלה */}
      <footer
        dir="rtl"
        className="hidden md:flex flex-col items-center gap-16 py-[72px] md:py-[100px] px-6 bg-[#7A7474] text-white"
      >
        <div className="w-full max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
            {/* עלינו */}
            <div className="md:col-span-1 -mt-5">
              <img
                src="/logoExpress.png"
                alt="Express48"
                className="w-28 h-auto mb-4 cursor-pointer"
                loading="lazy"
                onClick={() => navigate("/")}
              />

              <p className="space-y-2 text-right">
                החנות שלנו למוצרי חשמל – איכות, שירות ואמינות. מבצעים מיוחדים
                ומשלוחים מהירים לכל רחבי הארץ{" "}
              </p>
              <div className="mt-8 md:col-span-1">
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

            {/* יצירת קשר */}
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
                  <h4 className="font-bold mb-4 text-right">02-5005050</h4>
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

      {/* בר תחתון למובייל */}
      <MobileFooterBar />
    </>
  );
};

export default Footer;
