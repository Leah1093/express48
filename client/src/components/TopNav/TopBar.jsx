// export default TopBar;
import IconWithCounter from "./IconWithCounter";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";
import React, { useState } from "react";
import CartDrawer from "./cart/CartDrawer";
import { Link } from "react-router-dom";
import { Shuffle, ShoppingCart, Heart, User } from "lucide-react";



function TopBar() {
  const [cartOpen, setCartOpen] = useState(false);
  return (
    <>
      <header className=" fixed top-0 left-0 z-[9999] bg-[#122947] w-[calc(100%-64px)] mr-16">
        <div className="flex items-center justify-between max-w-[1200px] mx-auto px-5 py-2 text-white pr-16">
          {/* אייקונים + תפריט */}
          <div className="flex items-center gap-4">
            <Shuffle className="w-6 h-6 text-white" />

            <div onClick={() => setCartOpen(true)}>
              <ShoppingCart className="w-6 h-6 text-white" />
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
