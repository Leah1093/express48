import { useState } from "react";

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    console.log("מחפש:", searchTerm);
  };

  const styles = {
    container: {
      backgroundColor: "#0d2d52",
      padding: "1rem",
    },
    inner: {
      position: "relative",
      maxWidth: "64rem",
      margin: "0 auto",
    },
    input: {
      width: "100%",
      padding: "0.5rem 2.5rem 0.5rem 0.625rem",
      borderRadius: "9999px",
      fontSize: "16px",
      outline: "none",
      border: "none",
      textAlign: "right",
      direction: "rtl",
      color: "black",
    },
    button: {
      position: "absolute",
      right: "0.75rem",
      top: "50%",
      transform: "translateY(-50%)",
      background: "transparent",
      border: "none",
      padding: 0,
      margin: 0,
      cursor: "pointer",
      width: "1.25rem",
      height: "1.25rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    icon: {
      width: "16px",
      height: "16px",
      opacity: 0.6,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="חיפוש מוצר"
          dir="rtl"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={styles.input}
        />
        <button onClick={handleSearch} style={styles.button}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/54/54481.png"
            alt="search"
            style={styles.icon}
          />
        </button>
      </div>
    </div>
  );
}

export default SearchBar;








