// קומפוננטת משתמש (התחברות/הרשמה ואייקון)
function UserMenu() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
      <span>התחברות / הרשמה</span>
      <img
        src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png" // אייקון משתמש לדוגמה
        alt="user"
        style={{ width: 24, height: 24 }}
      />
    </div>
  );
}
export default UserMenu;