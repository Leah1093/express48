export const ChevronDown = ({ className = "" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
    <path d="M12.6665 5.66675L7.6665 10.6667L2.6665 5.66675" stroke="#7A7474" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ArrowUpLeft = ({ className = "", stroke = "#101010" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
    <path d="M13 13L3 3M3 3V10.5M3 3H10.5" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
