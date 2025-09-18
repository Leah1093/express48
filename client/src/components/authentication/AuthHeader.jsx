import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function AuthHeader() {
    const isMobile = useSelector((state) => state.ui.isMobile);
    const navigate = useNavigate();

    if (isMobile) {
        return (
            <div className="sticky top-0 z-50 w-full flex items-center justify-between p-5 bg-[#FFF7F2] shadow-sm">
                <div className="absolute left-1/2 transform -translate-x-1/2">
                    <Link to="/">
                        <img
                            src="/logo.png"
                            alt="logo"
                            className="h-14 hover:cursor-pointer"
                        />
                    </Link>
                </div>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="ml-auto text-[#141414] text-2xl hover:cursor-pointer"
                >
                    <FiChevronRight />
                </button>
            </div>
        );
    }

    return (
        <div className="sticky top-0 z-50 mt-8 w-full flex items-center p-6 md:px-[10%] bg-white  ">
            <div className="absolute left-1/2 transform -translate-x-1/2">
                <Link to="/">
                    <img
                        src="/logo.png"
                        alt="logo"
                        className="h-14 hover:cursor-pointer"
                    />
                </Link>
            </div>

            <button
                type="button"
                onClick={() => navigate(-1)}
                className="ml-auto text-[#141414] text-2xl hover:cursor-pointer"
            >
                <FiChevronRight />
            </button>
        </div>
    );
}
