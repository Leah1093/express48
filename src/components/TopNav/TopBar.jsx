import IconWithCounter from "./IconWithCounter";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";
function TopBar() {
  return (
    <header style={{
      width: "100%",
      position: "fixed", // נשאר למעלה
      top: 0,
      left: 0,
      zIndex: 1000,
      backgroundColor: "#122947",
    }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "10px 20px",
          color: "white",
        }}
      >
        {/* אייקונים עם ספירה + תפריט */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <IconWithCounter icon="https://cdn-icons-png.flaticon.com/512/3081/3081623.png" count={0} altText="shuffle" />
          <IconWithCounter icon="https://cdn-icons-png.flaticon.com/512/833/833314.png" count={0} altText="cart" />
          <IconWithCounter icon="https://cdn-icons-png.flaticon.com/512/1077/1077035.png" count={0} altText="favorites" />
          <UserMenu />
        </div>

        {/* שדה חיפוש באמצע */}
        <div style={{ flex: 1, margin: "0 40px", maxWidth: "600px" }}>
          <SearchBar />
        </div>

        {/* לוגו בצד ימין */}
        <div style={{ flexShrink: 0 }}>
          <Logo />
        </div>
      </div>
    </header>
  );
}


export default TopBar;