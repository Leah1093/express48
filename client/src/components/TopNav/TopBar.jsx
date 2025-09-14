// export default TopBar;
import IconWithCounter from "./IconWithCounter";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";
import React, { useState, useEffect } from "react";
import CartDrawer from "./cart/CartDrawer";
import { Link } from "react-router-dom";
import { Shuffle, ShoppingCart, Heart, User, Menu } from "lucide-react";
import { useSelector } from "react-redux";
import MobileDrawerContent from "./MobileDrawerContent";
import { useDispatch } from "react-redux";
import { fetchCategories } from "../../redux/slices/categoriesSlice";


function TopBar() {
  const [cartOpen, setCartOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useSelector((state) => state.ui.isMobile);
  const cartItems = useSelector((state) => state.cart);
  const cartItemsGuest = useSelector((state) => state.guestCart);
  const user = useSelector((state) => state.user.user);
  const itemsToUse = user ? cartItems : cartItemsGuest;
  const guestFavorites = useSelector((state) => state.guestFavorites);
  const totalQuantity = itemsToUse.length;
  const categories = useSelector((state) => state.categories.items);
  const categoriesLoading = useSelector((state) => state.categories.loading);
  const dispatch = useDispatch();
  // Fetch categories if not loaded
  useEffect(() => {
    if (isMobile && categories.length === 0 && !categoriesLoading) {
      dispatch(fetchCategories());
    }
  }, [isMobile, categories.length, categoriesLoading, dispatch]);

  return (
    <>
      <header className="fixed top-0 left-0 z-[9999] w-full bg-white shadow-[0_2px_6px_0_rgba(108,108,108,0.15)] font-[Rubik]">
        <div
          className={
            isMobile
              ? "flex items-center justify-between mx-auto px-[24px] h-[68px] w-[430px] max-w-full flex-shrink-0"
              : "flex items-center justify-between w-full px-[64px] py-[9px]"
          }
          style={isMobile ? { width: "430px" } : {}}
        >
          {/* אייקונים */}
          <div
            className={
              isMobile
                ? "flex items-center gap-0"
                : "flex items-center gap-[24px]"
            }
          >
            {isMobile ? (
              <div className="flex items-center">
                {/* אייקון חיפוש מובייל */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M18.9998 19L13.8028 13.803M13.8028 13.803C15.2094 12.3964 15.9996 10.4887 15.9996 8.4995C15.9996 6.51031 15.2094 4.60258 13.8028 3.196C12.3962 1.78943 10.4885 0.999222 8.49931 0.999222C6.51011 0.999222 4.60238 1.78943 3.19581 3.196C1.78923 4.60258 0.999023 6.51031 0.999023 8.4995C0.999023 10.4887 1.78923 12.3964 3.19581 13.803C4.60238 15.2096 6.51011 15.9998 8.49931 15.9998C10.4885 15.9998 12.3962 15.2096 13.8028 13.803Z" stroke="#141414" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M18.9998 19L13.8028 13.803M13.8028 13.803C15.2094 12.3964 15.9996 10.4887 15.9996 8.4995C15.9996 6.51031 15.2094 4.60258 13.8028 3.196C12.3962 1.78943 10.4885 0.999222 8.49931 0.999222C6.51011 0.999222 4.60238 1.78943 3.19581 3.196C1.78923 4.60258 0.999023 6.51031 0.999023 8.4995C0.999023 10.4887 1.78923 12.3964 3.19581 13.803C4.60238 15.2096 6.51011 15.9998 8.49931 15.9998C10.4885 15.9998 12.3962 15.2096 13.8028 13.803Z" stroke="black" stroke-opacity="0.2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
            ) : (
              <>
                {/* אייקונים דסקטופ */}
                <div className="flex items-center gap-[24px]">
                  {/* <Shuffle className="w-[19.392px] h-[18px] text-[#141414]" strokeWidth={1.5} /> */}
                  <div className="relative cursor-pointer" onClick={() => setCartOpen(prev => !prev)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="20" viewBox="0 0 22 20" fill="none">
                      <path d="M1.25 1H2.636C3.146 1 3.591 1.343 3.723 1.835L4.106 3.272M4.106 3.272C9.67664 3.11589 15.2419 3.73515 20.642 5.112C19.818 7.566 18.839 9.95 17.718 12.25H6.5M4.106 3.272L6.5 12.25M6.5 12.25C5.70435 12.25 4.94129 12.5661 4.37868 13.1287C3.81607 13.6913 3.5 14.4544 3.5 15.25H19.25M5 18.25C5 18.4489 4.92098 18.6397 4.78033 18.7803C4.63968 18.921 4.44891 19 4.25 19C4.05109 19 3.86032 18.921 3.71967 18.7803C3.57902 18.6397 3.5 18.4489 3.5 18.25C3.5 18.0511 3.57902 17.8603 3.71967 17.7197C3.86032 17.579 4.05109 17.5 4.25 17.5C4.44891 17.5 4.63968 17.579 4.78033 17.7197C4.92098 17.8603 5 18.0511 5 18.25ZM17.75 18.25C17.75 18.4489 17.671 18.6397 17.5303 18.7803C17.3897 18.921 17.1989 19 17 19C16.8011 19 16.6103 18.921 16.4697 18.7803C16.329 18.6397 16.25 18.4489 16.25 18.25C16.25 18.0511 16.329 17.8603 16.4697 17.7197C16.6103 17.579 16.8011 17.5 17 17.5C17.1989 17.5 17.3897 17.579 17.5303 17.7197C17.671 17.8603 17.75 18.0511 17.75 18.25Z" stroke="#141414" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M1.25 1H2.636C3.146 1 3.591 1.343 3.723 1.835L4.106 3.272M4.106 3.272C9.67664 3.11589 15.2419 3.73515 20.642 5.112C19.818 7.566 18.839 9.95 17.718 12.25H6.5M4.106 3.272L6.5 12.25M6.5 12.25C5.70435 12.25 4.94129 12.5661 4.37868 13.1287C3.81607 13.6913 3.5 14.4544 3.5 15.25H19.25M5 18.25C5 18.4489 4.92098 18.6397 4.78033 18.7803C4.63968 18.921 4.44891 19 4.25 19C4.05109 19 3.86032 18.921 3.71967 18.7803C3.57902 18.6397 3.5 18.4489 3.5 18.25C3.5 18.0511 3.57902 17.8603 3.71967 17.7197C3.86032 17.579 4.05109 17.5 4.25 17.5C4.44891 17.5 4.63968 17.579 4.78033 17.7197C4.92098 17.8603 5 18.0511 5 18.25ZM17.75 18.25C17.75 18.4489 17.671 18.6397 17.5303 18.7803C17.3897 18.921 17.1989 19 17 19C16.8011 19 16.6103 18.921 16.4697 18.7803C16.329 18.6397 16.25 18.4489 16.25 18.25C16.25 18.0511 16.329 17.8603 16.4697 17.7197C16.6103 17.579 16.8011 17.5 17 17.5C17.1989 17.5 17.3897 17.579 17.5303 17.7197C17.671 17.8603 17.75 18.0511 17.75 18.25Z" stroke="black" stroke-opacity="0.2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    {totalQuantity > 0 && (
                      <span className="absolute right-0 top-0 flex flex-col justify-center items-center w-[12px] h-[12px] px-[1px] rounded-[16px] bg-[#FF6500]" style={{ minWidth: '12px', minHeight: '12px' }}>
                        <span className="flex-shrink-0" style={{ width: '5.17px', height: '7.1px', color: '#FFF', fontSize: '8px', lineHeight: '7px', textAlign: 'center' }}>{totalQuantity}</span>
                      </span>
                    )}
                  </div>
                  <div className="relative cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="22" viewBox="0 0 18 22" fill="none">
                      <path d="M12.75 5C12.75 5.99456 12.3549 6.94839 11.6516 7.65165C10.9484 8.35491 9.99454 8.75 8.99998 8.75C8.00541 8.75 7.05159 8.35491 6.34833 7.65165C5.64506 6.94839 5.24998 5.99456 5.24998 5C5.24998 4.00544 5.64506 3.05161 6.34833 2.34835C7.05159 1.64509 8.00541 1.25 8.99998 1.25C9.99454 1.25 10.9484 1.64509 11.6516 2.34835C12.3549 3.05161 12.75 4.00544 12.75 5ZM1.50098 19.118C1.53311 17.1504 2.33731 15.2742 3.74015 13.894C5.14299 12.5139 7.03206 11.7405 8.99998 11.7405C10.9679 11.7405 12.857 12.5139 14.2598 13.894C15.6626 15.2742 16.4668 17.1504 16.499 19.118C14.1464 20.1968 11.5881 20.7535 8.99998 20.75C6.32398 20.75 3.78398 20.166 1.50098 19.118Z" stroke="#141414" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M12.75 5C12.75 5.99456 12.3549 6.94839 11.6516 7.65165C10.9484 8.35491 9.99454 8.75 8.99998 8.75C8.00541 8.75 7.05159 8.35491 6.34833 7.65165C5.64506 6.94839 5.24998 5.99456 5.24998 5C5.24998 4.00544 5.64506 3.05161 6.34833 2.34835C7.05159 1.64509 8.00541 1.25 8.99998 1.25C9.99454 1.25 10.9484 1.64509 11.6516 2.34835C12.3549 3.05161 12.75 4.00544 12.75 5ZM1.50098 19.118C1.53311 17.1504 2.33731 15.2742 3.74015 13.894C5.14299 12.5139 7.03206 11.7405 8.99998 11.7405C10.9679 11.7405 12.857 12.5139 14.2598 13.894C15.6626 15.2742 16.4668 17.1504 16.499 19.118C14.1464 20.1968 11.5881 20.7535 8.99998 20.75C6.32398 20.75 3.78398 20.166 1.50098 19.118Z" stroke="black" stroke-opacity="0.2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </div>
                  <Link to="/favorites">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M21 8.25C21 5.765 18.901 3.75 16.312 3.75C14.377 3.75 12.715 4.876 12 6.483C11.285 4.876 9.623 3.75 7.687 3.75C5.1 3.75 3 5.765 3 8.25C3 15.47 12 20.25 12 20.25C12 20.25 21 15.47 21 8.25Z" stroke="#141414" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M21 8.25C21 5.765 18.901 3.75 16.312 3.75C14.377 3.75 12.715 4.876 12 6.483C11.285 4.876 9.623 3.75 7.687 3.75C5.1 3.75 3 5.765 3 8.25C3 15.47 12 20.25 12 20.25C12 20.25 21 15.47 21 8.25Z" stroke="black" stroke-opacity="0.2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </Link>
                  <UserMenu />

                </div>
              </>
            )}
          </div>

          {/* חיפוש ולוגו */}
          {isMobile ? (
            <div className="flex items-center justify-center flex-1">
              {/* לוגו מובייל */}
              <Link to="/products">
                <div
                  className="flex items-center justify-center"
                  style={{ width: "111px", height: "50px", aspectRatio: "111/50" }}
                >
                  <Logo />
                </div>
              </Link>
            </div>
          ) : (
            <>
              {/* חיפוש דסקטופ */}
              <div className="flex items-center gap-4 flex-1 mx-10 max-w-[1018px] h-[48px] px-[2px_16px_0_16px] rounded-[16px] border border-[#EDEDED] bg-white">

                <div className="flex-1">
                  <SearchBar />
                </div>
              </div>
              {/* לוגו דסקטופ */}
              <Link to="/products">
                <div
                  className="flex items-center justify-center ml-8"
                  style={{ width: "111px", height: "50px", aspectRatio: "111/50" }}
                >
                  <Logo />
                </div>
              </Link>
            </>
          )}

          {/* אייקון המבורגר מובייל */}
          {isMobile && (
            <div className="flex items-center">
              <button
                className="flex items-center justify-center w-[47px] h-[44px] p-0"
                onClick={() => setDrawerOpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16.5" height="10.5" viewBox="0 0 18 12" fill="none">
                  <path d="M0.75 0.75H17.25M0.75 6H17.25M0.75 11.25H17.25" stroke="#141414" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M0.75 0.75H17.25M0.75 6H17.25M0.75 11.25H17.25" stroke="black" strokeOpacity="0.2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Drawer */}
      {isMobile && drawerOpen && (
        <MobileDrawerContent categories={categories} onClose={() => setDrawerOpen(false)} />
      )}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <div className="h-[12vh]"></div>
    </>
  );
}

export default TopBar;
