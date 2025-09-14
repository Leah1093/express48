import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MobileDrawerContent({ categories, onClose }) {
    const [showCategories, setShowCategories] = useState(false);
    const [showPersonal, setShowPersonal] = useState(false);
    const [showSupport, setShowSupport] = useState(false);
    const naviagate = useNavigate();
    return (
        <div className="fixed top-0 left-0 w-full h-full bg-white z-[99999] overflow-y-auto">
            {/* Header - Figma spec */}
            <div className="flex items-center justify-end gap-[10px] bg-[#FFF7F2]" style={{ width: '100%' }}>
                <div className="w-full flex justify-end items-center" style={{ height: 53, padding: '14px 22px' }}>
                    <span
                        className="flex-1 text-center text-black font-[Rubik] text-[14px] font-semibold leading-[150%] tracking-[-0.154px]"
                        style={{ letterSpacing: '-0.154px' }}
                    >
                        תפריט
                    </span>
                    <button onClick={onClose} className="flex items-center px-0">
                        <span className="w-[25px] h-[24px] flex-shrink-0 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="7.5" height="15" viewBox="0 0 7.5 15" fill="none">
                              <path d="M0 0L7.5 7.5L0 15" stroke="#141414" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                    </button>
                </div>
            </div>


            <div className="px-4 py-2">
                <button
                    className="w-full flex items-center justify-between py-6 border-b border-[#EDEDED] bg-white"
                    onClick={() => setShowCategories((v) => !v)}
                    style={{ direction: 'rtl' }}
                >
                    <span className="text-right text-[#141414] font-[Rubik] text-[16px] font-semibold leading-[120%] tracking-[-0.176px]">
                        כל הקטגוריות
                    </span>
                    <span className={`w-[24px] h-[24px] flex items-center justify-center transition-transform duration-200 ${showCategories ? '' : 'rotate-90'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="10" viewBox="0 0 18 10" fill="none">
                            <path d="M16.5 1.25L9 8.75L1.5 1.25" stroke="#141414" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16.5 1.25L9 8.75L1.5 1.25" stroke="black" strokeOpacity="0.2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </span>
                </button>
                {showCategories && (
                    <div className="bg-white rounded-lg shadow p-3">
                        <ul>
                            {categories.filter(cat => !cat.parentId).map(cat => (
                                <li key={cat._id} className="flex items-center gap-2 mb-3" style={{ direction: 'rtl' }}>
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                        <img src={`http://localhost:8080${cat.icon}`} alt={cat.name} className="w-8 h-8 object-contain" />
                                    </div>
                                    <span className="text-sm font-medium text-right">{cat.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <button
                    className="w-full flex items-center justify-between py-6 border-b border-[#EDEDED] bg-white"
                    onClick={() => setShowPersonal((v) => !v)}
                    style={{ direction: 'rtl' }}
                >
                    <span className="text-right text-[#141414] font-[Rubik] text-[16px] font-semibold leading-[120%] tracking-[-0.176px]">
                        אזור אישי
                    </span>
                    <span className={`w-[24px] h-[24px] flex items-center justify-center transition-transform duration-200 ${showPersonal ? '' : 'rotate-90'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="10" viewBox="0 0 18 10" fill="none">
                            <path d="M16.5 1.25L9 8.75L1.5 1.25" stroke="#141414" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16.5 1.25L9 8.75L1.5 1.25" stroke="black" strokeOpacity="0.2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </span>
                </button>
                {showPersonal && (
                    <div className="bg-white rounded-lg shadow p-4 mb-3">
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex flex-row-reverse items-center justify-center gap-2 p-4 rounded-xl border border-gray-200 hover:bg-gray-50"
                                onClick={() => {
                                    onClose();
                                    naviagate('/orders');
                                }}>
                                <span className="text-base font-normal text-gray-800 flex items-center justify-center">הזמנות שלי</span>
                                <span className="text-orange-500 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path d="M6 2l1.5 4h9L18 2" /><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M9 10h6" /></svg>
                                </span>
                            </button>
                            <button className="flex flex-row-reverse items-center justify-center gap-2 p-4 rounded-xl border border-gray-200 hover:bg-gray-50"
                                onClick={() => {
                                    onClose();
                                    naviagate('/cart');
                                }}>
                                <span className="text-base font-normal text-gray-800 flex items-center justify-center">עגלת קניות</span>
                                <span className="text-orange-500 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
                                </span>
                            </button>
                            <button className="flex flex-row-reverse items-center justify-center gap-2 p-4 rounded-xl border border-gray-200 hover:bg-gray-50"
                                onClick={() => {
                                    onClose();
                                    naviagate('/favorites');
                                }}>
                                <span className="text-base font-normal text-gray-800 flex items-center justify-center">אהבתי</span>
                                <span className="text-orange-500 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 1.01 4.5 2.09C13.09 4.01 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                                </span>
                            </button>
                            <button className="flex flex-row-reverse items-center justify-center gap-2 p-4 rounded-xl border border-gray-200 hover:bg-gray-50"
                                onClick={() => {
                                    onClose();
                                    naviagate('/profile');
                                }}>
                                <span className="text-base font-normal text-gray-800 flex items-center justify-center">הפרופיל שלי</span>
                                <span className="text-orange-500 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><circle cx="12" cy="8" r="4" /><path d="M12 12c-4 0-6 2-6 4v2h12v-2c0-2-2-4-6-4z" /></svg>
                                </span>
                            </button>
                        </div>
                    </div>
                )}
                <button
                    className="w-full flex items-center justify-between py-6 border-b border-[#EDEDED] bg-white"
                    onClick={() => setShowSupport((v) => !v)}
                    style={{ direction: 'rtl' }}
                >
                    <span className="text-right text-[#141414] font-[Rubik] text-[16px] font-semibold leading-[120%] tracking-[-0.176px]">
                        שירות לקוחות
                    </span>
                    <span className={`w-[24px] h-[24px] flex items-center justify-center transition-transform duration-200 ${showSupport ? '' : 'rotate-90'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="10" viewBox="0 0 18 10" fill="none">
                            <path d="M16.5 1.25L9 8.75L1.5 1.25" stroke="#141414" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16.5 1.25L9 8.75L1.5 1.25" stroke="black" strokeOpacity="0.2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </span>
                </button>
                {showSupport && (
                    <div className="bg-white rounded-lg shadow p-4 mb-3">
                        <div className="flex flex-col gap-4">
                            {/* טלפון אימייל */}
                            <div className="flex flex-col items-end p-4 rounded-xl border border-gray-200 bg-white text-right">
                                <div className="flex flex-row-reverse items-center gap-2 mb-1 w-full justify-end">
                                    <span className="text-base font-normal text-gray-800">אימייל</span>
                                    <span className="text-gray-700 flex items-center">
                                        {/* Envelope icon */}
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><rect x="3" y="7" width="18" height="10" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
                                    </span>
                                </div>
                                <span className="text-orange-600 font-bold text-base w-full text-right">025795588</span>
                            </div>
                            {/* טלפון רגיל */}
                            <div className="flex flex-col items-end p-4 rounded-xl border border-gray-200 bg-white text-right">
                                <div className="flex flex-row-reverse items-center gap-2 mb-1 w-full justify-end">
                                    <span className="text-base font-normal text-gray-800">טלפון</span>
                                    <span className="text-gray-700 flex items-center">
                                        {/* Phone icon */}
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path d="M22 16.92V19a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3 5.18 2 2 0 0 1 5 3h2.09a2 2 0 0 1 2 1.72c.13.81.28 1.61.46 2.39a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c.78.18 1.58.33 2.39.46A2 2 0 0 1 22 16.92z" /></svg>
                                    </span>
                                </div>
                                <span className="text-orange-600 font-bold text-base w-full text-right">025795588</span>
                            </div>
                            {/* וואטסאפ */}
                            <div className="flex flex-col items-end p-4 rounded-xl border border-gray-200 bg-white text-right">
                                <div className="flex flex-row-reverse items-center gap-2 mb-1 w-full justify-end">
                                    <span className="text-base font-normal text-gray-800">וואצאפ</span>
                                    <span className="text-gray-700 flex items-center">
                                        {/* Envelope icon */}
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><rect x="3" y="7" width="18" height="10" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
                                    </span>
                                </div>
                                <span className="text-orange-600 font-bold text-base w-full text-right">0529002178</span>
                            </div>
                        </div>
                    </div>
                )}
                <button
                    className="w-full flex items-center justify-between py-6 border-b border-[#EDEDED] bg-white"
                    style={{ direction: 'rtl' }}
                >
                    <span className="text-right text-[#141414] font-[Rubik] text-[16px] font-semibold leading-[120%] tracking-[-0.176px]">
                        נגישות
                    </span>
                    <span className={`w-[24px] h-[24px] flex items-center justify-center transition-transform duration-200 rotate-90`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="10" viewBox="0 0 18 10" fill="none">
                            <path d="M16.5 1.25L9 8.75L1.5 1.25" stroke="#141414" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16.5 1.25L9 8.75L1.5 1.25" stroke="black" strokeOpacity="0.2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </span>
                </button>
            </div>
        </div>
    );
}
