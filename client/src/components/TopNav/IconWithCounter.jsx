
function IconWithCounter({ icon, count, altText }) {
  return (
    <div style={{ position: "relative", margin: "0 10px", cursor: "pointer" }}>
      <img src={icon} alt={altText} style={{ width: 24, height: 24, filter: "invert(1)", }} />
      {count > 0 && (
        <span
          style={{
            position: "absolute",
            top: -5,
            right: -5,
            backgroundColor: "white",
            color: "white",
            borderRadius: "50%",
            padding: "2px 6px",
            fontSize: 12,
            fontWeight: "bold",
          }}
        >
          {count}
        </span>
      )}
    </div>
  );
}
export default IconWithCounter;