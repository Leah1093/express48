import { useSelector } from "react-redux";

// קומפוננטת לוגו / שם אתר
function Logo() {
  const isMobile = useSelector((state) => state.ui.isMobile);

  return (
    <div className="cursor-pointer">
      <img
        src={`/${isMobile ? "MobileLogo" : "logoExpress"}.png`}
        alt="Express48 Logo"
        className="h-16 w-auto"
      />
    </div>
  );
}

export default Logo;
