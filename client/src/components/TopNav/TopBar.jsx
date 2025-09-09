// export default TopBar;
import IconWithCounter from "./IconWithCounter";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";
import React, { useState } from "react";
import CartDrawer from "./cart/CartDrawer";
import { Link } from "react-router-dom";
import { Shuffle, ShoppingCart, Heart, User } from "lucide-react";
import { useSelector } from "react-redux";



function TopBar() {
  const [cartOpen, setCartOpen] = useState(false);
  // ניגשים לפריטים בעגלה מתוך Redux
  const cartItems = useSelector((state) => state.cart);
  const cartItemsGuest = useSelector((state) => state.guestCart)
  const user = useSelector((state) => state.user.user);
  const itemsToUse = user ? cartItems : cartItemsGuest;
  const guestFavorites = useSelector((state) =>state.guestFavorites)
 

  // סופרים את כל הכמויות
  const totalQuantity = itemsToUse.length;
 
  return (
    <>
      <header className=" fixed top-0 left-0 z-[9999] bg-[#122947] w-[calc(100%-64px)] mr-16">
        <div className="flex items-center justify-between max-w-[1200px] mx-auto px-5 py-2 text-white pr-16">
          {/* אייקונים + תפריט */}
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

          {/* חיפוש במרכז */}
          <div className="flex-1 mx-10 max-w-[600px]">
            <SearchBar />
          </div>

          {/* לוגו בצד ימין */}
          <Link to="/products">
            <div className="shrink-0">
              <Logo />
            </div>
          </Link>
        </div>
      </header>

      {/* מרווח מתחת ל-TopBar כדי לא להסתיר את MainNav */}
      <div className="h-[12vh]"></div>
    </>
  );
}

export default TopBar;
