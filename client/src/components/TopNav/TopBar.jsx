// export default TopBar;
import IconWithCounter from "./IconWithCounter";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";
import { useState, useEffect } from "react";
import CartDrawer from "./cart/CartDrawer";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import MobileDrawerContent from "./MobileDrawerContent";
import { useDispatch } from "react-redux";
import { fetchCategories } from "../../redux/slices/categoriesSlice";
import { IoSearchOutline, IoHeartOutline, IoMenuOutline } from "react-icons/io5";
import { HiOutlineUser, HiOutlineShoppingCart, HiOutlineChevronRight } from "react-icons/hi2";



function TopBar() {
  const [cartOpen, setCartOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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
          className={isMobile
            ? "flex items-center justify-between mx-auto px-[24px] h-[68px] w-[430px] max-w-full flex-shrink-0"
            : "flex items-center justify-between w-full px-[64px] py-[9px]"}
          style={isMobile ? { width: "430px" } : {}}
        >
          {/* מובייל: חיפוש */}
          {isMobile && isSearchOpen ? (
            <div className="flex items-center gap-4 flex-1 h-[48px] px-[2px_16px_0_16px] rounded-[16px] bg-white">
              <div className="flex-1">
                <SearchBar />
              </div>
              <HiOutlineChevronRight onClick={() => setIsSearchOpen(false)} />
            </div>
          ) : (
            <>
              {/* אייקונים */}
              <div className={isMobile ? "flex items-center gap-0" : "flex items-center gap-[24px]"}>
                {isMobile ? (
                  <div className="flex items-center">
                    {/* אייקון חיפוש מובייל */}
                    <IoSearchOutline className="w-5 h-5 text-[#141414] cursor-pointer" onClick={() => setIsSearchOpen(true)} />
                  </div>
                ) : (
                  <div className="flex items-center gap-[24px]">
                    <div className="relative cursor-pointer" onClick={() => setCartOpen(prev => !prev)}>
                      <HiOutlineShoppingCart className="w-6 h-6 text-[#141414]" />
                      {totalQuantity > 0 && (
                        <span className="absolute right-0 top-0 flex flex-col justify-center items-center w-[12px] h-[12px] px-[1px] rounded-[16px] bg-[#FF6500]" style={{ minWidth: '12px', minHeight: '12px' }}>
                          <span className="flex-shrink-0" style={{ width: '5.17px', height: '7.1px', color: '#FFF', fontSize: '8px', lineHeight: '7px', textAlign: 'center' }}>{totalQuantity}</span>
                        </span>
                      )}
                    </div>
                    <div className="relative cursor-pointer">
                      <HiOutlineUser className="w-6 h-6 text-[#141414]" />
                    </div>
                    <Link to="/favorites">
                      <IoHeartOutline className="w-6 h-6 text-[#141414]" />
                    </Link>
                    <UserMenu />
                  </div>
                )}
              </div>
              
              {/* מובייל: לוגו ואייקון המבורגר */}
              {isMobile && (
                <>
                  <div className="flex items-center justify-center flex-1">
                    <Link to="/products">
                      <div
                        className="flex items-center justify-center"
                        style={{ width: "111px", height: "50px", aspectRatio: "111/50" }}
                      >
                        <Logo />
                      </div>
                    </Link>
                  </div>
                  <div className="flex items-center">
                    <button
                      className="flex items-center justify-center w-[47px] h-[44px] p-0"
                      onClick={() => setDrawerOpen(true)}
                    >
                      <IoMenuOutline className="w-6 h-6 text-[#141414]" />
                    </button>
                  </div>
                </>
              )}
            </>
          )}
          {/* דסקטופ: חיפוש ולוגו */}
          {!isMobile && (
            <>
              <div className="flex items-center gap-4 flex-1 mx-10 max-w-[1018px] h-[48px] px-[2px_16px_0_16px] rounded-[16px] border border-[#EDEDED] bg-white">
                <div className="flex-1">
                  <SearchBar />
                </div>
              </div>
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
