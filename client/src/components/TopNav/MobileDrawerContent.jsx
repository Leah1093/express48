import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoHeartOutline,IoMailOpenOutline , IoLogoWhatsapp, } from "react-icons/io5";
import { HiOutlineArchiveBox } from "react-icons/hi2";
import { HiOutlineUser, HiOutlineChevronDown, HiOutlineChevronRight, HiOutlineShoppingCart,HiOutlinePhone } from "react-icons/hi2";


export default function MobileDrawerContent({ categories, onClose }) {
    const [showCategories, setShowCategories] = useState(false);
    const [showPersonal, setShowPersonal] = useState(false);
    const [showSupport, setShowSupport] = useState(false);
    const navigate = useNavigate();

    const personalActions = [
        { label: "הזמנות שלי", to: "/orders", icon: <HiOutlineArchiveBox className="w-6 h-6 text-orange-500" /> },
        { label: "עגלת קניות", to: "/cart", icon: <HiOutlineShoppingCart className="w-6 h-6 text-orange-500" /> },
        { label: "אהבתי", to: "/favorites", icon: <IoHeartOutline className="w-6 h-6 text-orange-500" /> },
        { label: "הפרופיל שלי", to: "/profile", icon: <HiOutlineUser className="w-6 h-6 text-orange-500" /> },
    ];

    const supportContacts = [
        { label: "אימייל", value: "support@express48.co.il", icon: <IoMailOpenOutline className="w-6 h-6 text-gray-800" /> },
        { label: "טלפון", value: "025795588", icon: <HiOutlinePhone className="w-6 h-6 text-gray-800" /> },
        { label: "וואצאפ", value: "0529002178", icon: <IoLogoWhatsapp className="w-6 h-6 text-gray-800" /> },
    ];

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-white z-[99999] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-end gap-[10px] bg-[#FFF7F2] w-full">
                <div className="w-full flex justify-end items-center h-[53px] px-[22px]">
                    <span className="flex-1 text-center text-black font-[Rubik] text-[14px] font-semibold leading-[150%]">
                        תפריט
                    </span>
                    <button onClick={onClose} className="flex items-center px-0">
                        <HiOutlineChevronRight className="w-6 h-6 text-[#141414]" />
                    </button>
                </div>
            </div>

            <div className="px-4 py-2">
                {/* === קטגוריות === */}
                <button
                    className="w-full flex items-center justify-between py-6 border-b border-[#EDEDED] bg-white"
                    onClick={() => setShowCategories((v) => !v)}
                    style={{ direction: "rtl" }}
                >
                    <span className="text-right text-[#141414] font-[Rubik] text-[16px] font-semibold">
                        כל הקטגוריות
                    </span>
                    <span className={`w-[24px] h-[24px] flex items-center justify-center transition-transform duration-200 ${showCategories ? "" : "rotate-90"}`}>
                        <HiOutlineChevronDown className="w-6 h-6 text-[#141414]" />

                    </span>
                </button>
                {showCategories && (
                    <div className="flex flex-col items-end pb-4 gap-4 w-full">
                        <div className="flex flex-col items-end gap-1 p-1 w-full rounded-[8px] border border-[#EDEDED] bg-white">
                            {categories.filter(cat => !cat.parentId).map(cat => (
                                <div
                                    key={cat._id}
                                    className="flex justify-end items-center gap-4 p-4 w-full rounded-[16px] hover:bg-gray-50 cursor-pointer"
                                >
                                    <span className="text-right text-[#141414] text-[14px]">
                                        {cat.name}
                                    </span>
                                    <div className="w-[58px] h-[58px] rounded-full border border-[#EDEDED] bg-gray-100 overflow-hidden flex items-center justify-center">
                                        <img
                                            src={`http://localhost:8080${cat.icon}`}
                                            alt={cat.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* === אזור אישי === */}
                <button
                    className="w-full flex items-center justify-between py-6 border-b border-[#EDEDED] bg-white"
                    onClick={() => setShowPersonal((v) => !v)}
                    style={{ direction: "rtl" }}
                >
                    <span className="text-right text-[#141414] font-[Rubik] text-[16px] font-semibold">
                        אזור אישי
                    </span>
                    <span className={`w-[24px] h-[24px] flex items-center justify-center transition-transform duration-200 ${showPersonal ? "" : "rotate-90"}`}>
                        <HiOutlineChevronDown className="w-6 h-6 text-[#141414]" />

                    </span>
                </button>
                {showPersonal && (
                    <div className="flex flex-col items-end pb-4 gap-4 w-full">
                        <div className="flex flex-wrap gap-4 w-full max-w-[367px]">
                            {personalActions.map((action, index) => (
                                <button
                                    key={index}
                                    className="flex w-[175.5px] h-[92px] px-6 py-4 justify-end items-center gap-[23px] rounded-[12px] border border-[#EDEDED] bg-white"
                                    onClick={() => {
                                        onClose();
                                        navigate(action.to);
                                    }}
                                >
                                    <div className="flex flex-col justify-center items-end gap-4 text-right">
                                        <span className="text-[#141414] text-[16px]">{action.label}</span>
                                    </div>
                                    {action.icon}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* === שירות לקוחות === */}
                <button
                    className="w-full flex items-center justify-between py-6 border-b border-[#EDEDED] bg-white"
                    onClick={() => setShowSupport((v) => !v)}
                    style={{ direction: "rtl" }}
                >
                    <span className="text-right text-[#141414] font-[Rubik] text-[16px] font-semibold">
                        שירות לקוחות
                    </span>
                    <span className={`w-[24px] h-[24px] flex items-center justify-center transition-transform duration-200 ${showSupport ? "" : "rotate-90"}`}>
                        <HiOutlineChevronDown className="w-6 h-6 text-[#141414]" />

                    </span>
                </button>
                {showSupport && (
                    <div className="flex flex-col items-end gap-4 pb-4 w-full">
                        {supportContacts.map((contact, index) => (
                            <div key={index} className="flex flex-col items-end p-4 rounded-xl border border-gray-200 bg-white w-full">
                                <div className="flex justify-end items-center gap-2 mb-1 w-full">
                                    <span className="text-[#141414] text-base">{contact.label}</span>
                                    {contact.icon}
                                </div>
                                <span className="text-orange-600 font-bold text-base w-full text-right">
                                    {contact.value}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* === נגישות === */}
                <button className="w-full flex items-center justify-between py-6 border-b border-[#EDEDED] bg-white" style={{ direction: "rtl" }}>
                    <span className="text-right text-[#141414] font-[Rubik] text-[16px] font-semibold">
                        נגישות
                    </span>
                    <span className="w-[24px] h-[24px] flex items-center justify-center rotate-90">
                        <HiOutlineChevronDown className="w-6 h-6 text-[#141414]" />
                    </span>
                </button>
            </div>
        </div>
    );
}
