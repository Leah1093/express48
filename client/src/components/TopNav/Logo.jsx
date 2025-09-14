import { useSelector } from "react-redux";

// קומפוננטת לוגו / שם אתר
function Logo() {

  return (
    <div className="cursor-pointer">
      <img
        src="/logo.png"
        alt="Express48 Logo"
        className="h-16 w-auto"
      />
    </div>
  );
}

export default Logo;
