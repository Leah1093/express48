// export default TopBar;
import IconWithCounter from "./IconWithCounter";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";

function TopBar() {
  return (
    <>
      <header className=" fixed top-0 left-0 z-[1000] bg-[#122947] w-[calc(100%-64px)] mr-16">
        <div className="flex items-center justify-between max-w-[1200px] mx-auto px-5 py-2 text-white pr-16">
          {/* אייקונים + תפריט */}
          <div className="flex items-center gap-2">
            <IconWithCounter icon="https://cdn-icons-png.flaticon.com/512/3081/3081623.png" count={0} altText="shuffle" />
            <IconWithCounter icon="https://cdn-icons-png.flaticon.com/512/833/833314.png" count={0} altText="cart" />
            <IconWithCounter icon="https://cdn-icons-png.flaticon.com/512/1077/1077035.png" count={0} altText="favorites" />
            <UserMenu />
          </div>

          {/* חיפוש במרכז */}
          <div className="flex-1 mx-10 max-w-[600px]">
            <SearchBar />
          </div>

          {/* לוגו בצד ימין */}
          <div className="shrink-0">
            <Logo />
          </div>
        </div>
      </header>

      {/* מרווח מתחת ל-TopBar כדי לא להסתיר את MainNav */}
      <div className="h-[12vh]"></div>
    </>
  );
}

export default TopBar;
