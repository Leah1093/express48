// src/components/.../ZoomButton.jsx
export default function ZoomButton({ onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="הגדלת תמונה"
      title="הגדלת תמונה"
      className={[
        // 40x40, padding:10px, מרכז, פינות 8px, רקע לבן, צל כפול
        "flex w-10 h-10 p-2 justify-center items-center",
        "rounded-lg bg-white",
        "shadow-[0_2.05px_4.1px_rgba(0,0,0,0.10),0_4.1px_6.14px_rgba(0,0,0,0.10)]",
        "hover:bg-gray-50 active:bg-gray-100 transition",
        className,
      ].join(" ")}
    >
      {/* אייקון הזכוכית מגדלת לפי המפרט שנתת */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24" height="24" viewBox="0 0 24 24" fill="none"
        aria-hidden="true"
      >
        <path d="M10.8688 19.9178C15.8664 19.9178 19.9177 15.8665 19.9177 10.8689C19.9177 5.87133 15.8664 1.82001 10.8688 1.82001C5.87127 1.82001 1.81995 5.87133 1.81995 10.8689C1.81995 15.8665 5.87127 19.9178 10.8688 19.9178Z" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22.18 22.18L17.2596 17.2597" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10.868 7.47565V14.2623" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7.47473 10.869H14.2614" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}
