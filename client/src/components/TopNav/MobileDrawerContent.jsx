import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MobileDrawerContent({ categories, onClose }) {
    const [showCategories, setShowCategories] = useState(false);
    const [showPersonal, setShowPersonal] = useState(false);
    const [showSupport, setShowSupport] = useState(false);
    const navigate = useNavigate();

    const personalActions = [
        {
            label: 'הזמנות שלי',
            to: '/orders',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="18" viewBox="0 0 22 18" fill="none">
                    <path d="M19.25 4.5L18.625 15.132C18.5913 15.705 18.3399 16.2436 17.9222 16.6373C17.5045 17.031 16.952 17.2502 16.378 17.25H5.622C5.04796 17.2502 4.49555 17.031 4.07783 16.6373C3.66011 16.2436 3.40868 15.705 3.375 15.132L2.75 4.5M9 8.25H13M2.375 4.5H19.625C20.246 4.5 20.75 3.996 20.75 3.375V1.875C20.75 1.254 20.246 0.75 19.625 0.75H2.375C1.754 0.75 1.25 1.254 1.25 1.875V3.375C1.25 3.996 1.754 4.5 2.375 4.5Z" stroke="#FF6500" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            )
        },
        {
            label: 'עגלת קניות',
            to: '/cart',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none">
                    <path d="M0.75 1H2.136C2.646 1 3.091 1.343 3.223 1.835L3.606 3.272M3.606 3.272C9.17664 3.11589 14.7419 3.73515 20.142 5.112C19.318 7.566 18.339 9.95 17.218 12.25H6M3.606 3.272L6 12.25M6 12.25C5.20435 12.25 4.44129 12.5661 3.87868 13.1287C3.31607 13.6913 3 14.4544 3 15.25H18.75M4.5 18.25C4.5 18.4489 4.42098 18.6397 4.28033 18.7803C4.13968 18.921 3.94891 19 3.75 19C3.55109 19 3.36032 18.921 3.21967 18.7803C3.07902 18.6397 3 18.4489 3 18.25C3 18.0511 3.07902 17.8603 3.21967 17.7197C3.36032 17.579 3.55109 17.5 3.75 17.5C3.94891 17.5 4.13968 17.579 4.28033 17.7197C4.42098 17.8603 4.5 18.0511 4.5 18.25ZM17.25 18.25C17.25 18.4489 17.171 18.6397 17.0303 18.7803C16.8897 18.921 16.6989 19 16.5 19C16.3011 19 16.1103 18.921 15.9697 18.7803C15.829 18.6397 15.75 18.4489 15.75 18.25C15.75 18.0511 15.829 17.8603 15.9697 17.7197C16.1103 17.579 16.3011 17.5 16.5 17.5C16.6989 17.5 16.8897 17.579 17.0303 17.7197C17.171 17.8603 17.25 18.0511 17.25 18.25Z" stroke="#FF6500" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            )
        },
        {
            label: 'אהבתי',
            to: '/favorites',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="21" height="18" viewBox="0 0 21 18" fill="none">
                    <path d="M19.5 5.25C19.5 2.765 17.401 0.75 14.812 0.75C12.877 0.75 11.215 1.876 10.5 3.483C9.785 1.876 8.123 0.75 6.187 0.75C3.6 0.75 1.5 2.765 1.5 5.25C1.5 12.47 10.5 17.25 10.5 17.25C10.5 17.25 19.5 12.47 19.5 5.25Z" stroke="#FF6500" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            )
        },
        {
            label: 'הפרופיל שלי',
            to: '/orders',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="22" viewBox="0 0 18 22" fill="none">
                    <path d="M12.75 5C12.75 5.99456 12.3549 6.94839 11.6516 7.65165C10.9484 8.35491 9.99454 8.75 8.99998 8.75C8.00541 8.75 7.05159 8.35491 6.34833 7.65165C5.64506 6.94839 5.24998 5.99456 5.24998 5C5.24998 4.00544 5.64506 3.05161 6.34833 2.34835C7.05159 1.64509 8.00541 1.25 8.99998 1.25C9.99454 1.25 10.9484 1.64509 11.6516 2.34835C12.3549 3.05161 12.75 4.00544 12.75 5ZM1.50098 19.118C1.53311 17.1504 2.33731 15.2742 3.74015 13.894C5.14299 12.5139 7.03206 11.7405 8.99998 11.7405C10.9679 11.7405 12.857 12.5139 14.2598 13.894C15.6626 15.2742 16.4668 17.1504 16.499 19.118C14.1464 20.1968 11.5881 20.7535 8.99998 20.75C6.32398 20.75 3.78398 20.166 1.50098 19.118Z" stroke="#FF6500" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            )
        },
        // הוסף עוד...
    ];


    const supportContacts = [
        {
            label: "אימייל",
            value: "025795588",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M21.75 8.99999V9.90599C21.75 10.3122 21.64 10.7109 21.4318 11.0597C21.2235 11.4085 20.9247 11.6943 20.567 11.887L14.089 15.375M2.25 8.99999V9.90599C2.24998 10.3122 2.35995 10.7109 2.56824 11.0597C2.77652 11.4085 3.07534 11.6943 3.433 11.887L9.911 15.375M9.911 15.375L10.933 14.825C11.2609 14.6484 11.6275 14.5559 12 14.5559C12.3725 14.5559 12.7391 14.6484 13.067 14.825L14.09 15.375L18.75 17.885M9.911 15.375L5.25 17.885M21.75 19.5C21.75 20.0967 21.5129 20.669 21.091 21.091C20.669 21.5129 20.0967 21.75 19.5 21.75H4.5C3.90326 21.75 3.33097 21.5129 2.90901 21.091C2.48705 20.669 2.25 20.0967 2.25 19.5V8.84399C2.24998 8.43775 2.35995 8.03908 2.56824 7.6903C2.77652 7.34152 3.07534 7.05564 3.433 6.86299L10.933 2.82399C11.2609 2.64736 11.6275 2.5549 12 2.5549C12.3725 2.5549 12.7391 2.64736 13.067 2.82399L20.567 6.86299C20.9245 7.05556 21.2232 7.34128 21.4315 7.68987C21.6398 8.03846 21.7498 8.43692 21.75 8.84299V19.5Z" stroke="#141414" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M21.75 8.99999V9.90599C21.75 10.3122 21.64 10.7109 21.4318 11.0597C21.2235 11.4085 20.9247 11.6943 20.567 11.887L14.089 15.375M2.25 8.99999V9.90599C2.24998 10.3122 2.35995 10.7109 2.56824 11.0597C2.77652 11.4085 3.07534 11.6943 3.433 11.887L9.911 15.375M9.911 15.375L10.933 14.825C11.2609 14.6484 11.6275 14.5559 12 14.5559C12.3725 14.5559 12.7391 14.6484 13.067 14.825L14.09 15.375L18.75 17.885M9.911 15.375L5.25 17.885M21.75 19.5C21.75 20.0967 21.5129 20.669 21.091 21.091C20.669 21.5129 20.0967 21.75 19.5 21.75H4.5C3.90326 21.75 3.33097 21.5129 2.90901 21.091C2.48705 20.669 2.25 20.0967 2.25 19.5V8.84399C2.24998 8.43775 2.35995 8.03908 2.56824 7.6903C2.77652 7.34152 3.07534 7.05564 3.433 6.86299L10.933 2.82399C11.2609 2.64736 11.6275 2.5549 12 2.5549C12.3725 2.5549 12.7391 2.64736 13.067 2.82399L20.567 6.86299C20.9245 7.05556 21.2232 7.34128 21.4315 7.68987C21.6398 8.03846 21.7498 8.43692 21.75 8.84299V19.5Z" stroke="black" stroke-opacity="0.2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            )
        },
        {
            label: "טלפון",
            value: "025795588",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M1.25 5.75C1.25 14.034 7.966 20.75 16.25 20.75H18.5C19.0967 20.75 19.669 20.5129 20.091 20.091C20.5129 19.669 20.75 19.0967 20.75 18.5V17.128C20.75 16.612 20.399 16.162 19.898 16.037L15.475 14.931C15.035 14.821 14.573 14.986 14.302 15.348L13.332 16.641C13.05 17.017 12.563 17.183 12.122 17.021C10.4849 16.4191 8.99815 15.4686 7.76478 14.2352C6.53141 13.0018 5.58087 11.5151 4.979 9.878C4.817 9.437 4.983 8.95 5.359 8.668L6.652 7.698C7.015 7.427 7.179 6.964 7.069 6.525L5.963 2.102C5.90214 1.85869 5.76172 1.6427 5.56405 1.48834C5.36638 1.33397 5.1228 1.25008 4.872 1.25H3.5C2.90326 1.25 2.33097 1.48705 1.90901 1.90901C1.48705 2.33097 1.25 2.90326 1.25 3.5V5.75Z" stroke="#141414" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M1.25 5.75C1.25 14.034 7.966 20.75 16.25 20.75H18.5C19.0967 20.75 19.669 20.5129 20.091 20.091C20.5129 19.669 20.75 19.0967 20.75 18.5V17.128C20.75 16.612 20.399 16.162 19.898 16.037L15.475 14.931C15.035 14.821 14.573 14.986 14.302 15.348L13.332 16.641C13.05 17.017 12.563 17.183 12.122 17.021C10.4849 16.4191 8.99815 15.4686 7.76478 14.2352C6.53141 13.0018 5.58087 11.5151 4.979 9.878C4.817 9.437 4.983 8.95 5.359 8.668L6.652 7.698C7.015 7.427 7.179 6.964 7.069 6.525L5.963 2.102C5.90214 1.85869 5.76172 1.6427 5.56405 1.48834C5.36638 1.33397 5.1228 1.25008 4.872 1.25H3.5C2.90326 1.25 2.33097 1.48705 1.90901 1.90901C1.48705 2.33097 1.25 2.90326 1.25 3.5V5.75Z" stroke="black" stroke-opacity="0.2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            )
        },
        {
            label: "וואצאפ",
            value: "0529002178",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="19" viewBox="0 0 20 19" fill="none">
                    <path d="M6.625 9C6.625 9.09946 6.58549 9.19484 6.51517 9.26517C6.44484 9.33549 6.34946 9.375 6.25 9.375C6.15054 9.375 6.05516 9.33549 5.98484 9.26517C5.91451 9.19484 5.875 9.09946 5.875 9C5.875 8.90054 5.91451 8.80516 5.98484 8.73483C6.05516 8.66451 6.15054 8.625 6.25 8.625C6.34946 8.625 6.44484 8.66451 6.51517 8.73483C6.58549 8.80516 6.625 8.90054 6.625 9ZM6.625 9H6.25M10.375 9C10.375 9.09946 10.3355 9.19484 10.2652 9.26517C10.1948 9.33549 10.0995 9.375 10 9.375C9.90054 9.375 9.80516 9.33549 9.73483 9.26517C9.66451 9.19484 9.625 9.09946 9.625 9C9.625 8.90054 9.66451 8.80516 9.73483 8.73483C9.80516 8.66451 9.90054 8.625 10 8.625C10.0995 8.625 10.1948 8.66451 10.2652 8.73483C10.3355 8.80516 10.375 8.90054 10.375 9ZM10.375 9H10M14.125 9C14.125 9.09946 14.0855 9.19484 14.0152 9.26517C13.9448 9.33549 13.8495 9.375 13.75 9.375C13.6505 9.375 13.5552 9.33549 13.4848 9.26517C13.4145 9.19484 13.375 9.09946 13.375 9C13.375 8.90054 13.4145 8.80516 13.4848 8.73483C13.5552 8.66451 13.6505 8.625 13.75 8.625C13.8495 8.625 13.9448 8.66451 14.0152 8.73483C14.0855 8.80516 14.125 8.90054 14.125 9ZM14.125 9H13.75M19 9C19 13.556 14.97 17.25 10 17.25C9.13718 17.251 8.27804 17.1377 7.445 16.913C6.27076 17.7389 4.83833 18.1141 3.41 17.97C3.25119 17.9547 3.09307 17.933 2.936 17.905C3.42887 17.3241 3.76547 16.6272 3.914 15.88C4.004 15.423 3.781 14.979 3.447 14.654C1.93 13.178 1 11.189 1 9C1 4.444 5.03 0.75 10 0.75C14.97 0.75 19 4.444 19 9Z" stroke="#141414" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M6.625 9C6.625 9.09946 6.58549 9.19484 6.51517 9.26517C6.44484 9.33549 6.34946 9.375 6.25 9.375C6.15054 9.375 6.05516 9.33549 5.98484 9.26517C5.91451 9.19484 5.875 9.09946 5.875 9C5.875 8.90054 5.91451 8.80516 5.98484 8.73483C6.05516 8.66451 6.15054 8.625 6.25 8.625C6.34946 8.625 6.44484 8.66451 6.51517 8.73483C6.58549 8.80516 6.625 8.90054 6.625 9ZM6.625 9H6.25M10.375 9C10.375 9.09946 10.3355 9.19484 10.2652 9.26517C10.1948 9.33549 10.0995 9.375 10 9.375C9.90054 9.375 9.80516 9.33549 9.73483 9.26517C9.66451 9.19484 9.625 9.09946 9.625 9C9.625 8.90054 9.66451 8.80516 9.73483 8.73483C9.80516 8.66451 9.90054 8.625 10 8.625C10.0995 8.625 10.1948 8.66451 10.2652 8.73483C10.3355 8.80516 10.375 8.90054 10.375 9ZM10.375 9H10M14.125 9C14.125 9.09946 14.0855 9.19484 14.0152 9.26517C13.9448 9.33549 13.8495 9.375 13.75 9.375C13.6505 9.375 13.5552 9.33549 13.4848 9.26517C13.4145 9.19484 13.375 9.09946 13.375 9C13.375 8.90054 13.4145 8.80516 13.4848 8.73483C13.5552 8.66451 13.6505 8.625 13.75 8.625C13.8495 8.625 13.9448 8.66451 14.0152 8.73483C14.0855 8.80516 14.125 8.90054 14.125 9ZM14.125 9H13.75M19 9C19 13.556 14.97 17.25 10 17.25C9.13718 17.251 8.27804 17.1377 7.445 16.913C6.27076 17.7389 4.83833 18.1141 3.41 17.97C3.25119 17.9547 3.09307 17.933 2.936 17.905C3.42887 17.3241 3.76547 16.6272 3.914 15.88C4.004 15.423 3.781 14.979 3.447 14.654C1.93 13.178 1 11.189 1 9C1 4.444 5.03 0.75 10 0.75C14.97 0.75 19 4.444 19 9Z" stroke="black" stroke-opacity="0.2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            )
        }
    ];


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
                            <path d="M16.5 1.25L9 8.75L1.5 1.25" stroke="#141414" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16.5 1.25L9 8.75L1.5 1.25" stroke="black" strokeOpacity="0.2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                </button>
                {showCategories && (
                    <div className="flex flex-col items-end pb-4 gap-4 w-full">
                        <div className="flex flex-col items-end gap-1 p-1 w-full rounded-[8px] border border-[#EDEDED] bg-white">
                            {categories.filter(cat => !cat.parentId).map(cat => (
                                <div key={cat._id} className="flex justify-end items-center gap-4 p-4 w-full rounded-[16px] hover:bg-gray-50 cursor-pointer">
                                    <div className="flex justify-end items-center gap-2">
                                        <span className="text-right text-[#141414] text-[14px] font-normal leading-[150%] tracking-[-0.154px]">
                                            {cat.name}
                                        </span>
                                    </div>
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
                            <path d="M16.5 1.25L9 8.75L1.5 1.25" stroke="#141414" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16.5 1.25L9 8.75L1.5 1.25" stroke="black" strokeOpacity="0.2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                </button>
                {showPersonal && (<div className="flex flex-col items-end pb-4 gap-4 w-full">
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
                                    <span className="text-[#141414] text-[16px] font-normal leading-[120%] tracking-[-0.176px]">
                                        {action.label}
                                    </span>
                                </div>
                                <div className="flex-shrink-0 w-[18px] h-[16.5px]">{action.icon}</div>
                            </button>
                        ))}
                    </div>
                </div>)}

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
                            <path d="M16.5 1.25L9 8.75L1.5 1.25" stroke="#141414" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16.5 1.25L9 8.75L1.5 1.25" stroke="black" strokeOpacity="0.2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                </button>
                {showSupport && (
                    <div className="flex flex-col items-end gap-4 pb-4 w-full">
                        <div className="flex flex-col justify-center items-start gap-4 w-full">
                            {supportContacts.map((contact, index) => (
                                <div key={index} className="flex flex-col items-end p-4 rounded-xl border border-gray-200 bg-white w-full">
                                    <div className="flex justify-end items-center gap-2 mb-1 w-full">
                                        <span className="text-[#141414] text-base font-normal leading-[120%] tracking-[-0.176px]">
                                            {contact.label}
                                        </span>
                                        <span className="text-gray-700 flex items-center">
                                            {contact.icon}
                                        </span>
                                    </div>
                                    <span className="text-orange-600 font-bold text-base w-full text-right">{contact.value}</span>
                                </div>
                            ))}
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
                            <path d="M16.5 1.25L9 8.75L1.5 1.25" stroke="#141414" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16.5 1.25L9 8.75L1.5 1.25" stroke="black" strokeOpacity="0.2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                </button>
            </div>
        </div>
    );
}
