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
      <header className={isMobile ? "fixed top-0 left-0 z-[9999] w-full bg-white shadow-[0_2px_6px_0_rgba(108,108,108,0.15)]" : "fixed top-0 left-0 z-[9999] bg-[#122947] w-full"}>
        <div className={isMobile ? "flex items-center justify-between w-full px-[24px] h-[68px]" : "flex items-center justify-between max-w-[1200px] mx-auto px-5 py-2 text-white"}>
          {isMobile ? (
            /* מובייל:  */
            <>
              <div className="flex items-center w-full justify-between mx-auto" style={{ maxWidth: 430, width: '100%' }}>
                {/* אייקון חיפוש */}
                <div className="flex items-center">
                  <button className="p-0 w-[24px] h-[24px] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[24px] h-[24px] text-gray-700">
                      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                    </svg>
                  </button>
                </div>
                {/* לוגו */}
                <div className="flex-1 flex justify-center">
                  <Link to="/products">
                    <Logo />
                  </Link>
                </div>
                {/* אייקון המבורגר  */}
                <div className="flex items-center">
                  <button className="p-0 w-[24px] h-[24px] flex items-center justify-center" onClick={() => setDrawerOpen(true)}>
                    <Menu className="w-[24px] h-[24px] text-gray-700" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* מחשב:  */
            <>
              <div className="flex items-center gap-4">
                <Shuffle className="w-6 h-6 text-white" />
                <div className="relative cursor-pointer" onClick={() => setCartOpen(true)}>
                  <ShoppingCart className="w-6 h-6 text-white" />
                  {totalQuantity > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {totalQuantity}
                    </span>
                  )}
                </div>
                <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
                <Link to="/favorites">
                  <Heart className="w-6 h-6 text-white" />
                </Link>
                <UserMenu />
              </div>
              <div className="flex-1 mx-10 max-w-[600px]">
                <SearchBar />
              </div>
              <Link to="/products">
                <div className="shrink-0">
                  <Logo />
                </div>
              </Link>
            </>
          )}
        </div>
      </header >

      {/* Drawer */}
      {isMobile && drawerOpen && (
        <MobileDrawerContent categories={categories} onClose={() => setDrawerOpen(false)} />
      )}

      <div className="h-[12vh]"></div>
    </>
  );
}

export default TopBar;
