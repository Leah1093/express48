export default function SellerHeader({ seller }) {
  const statusTone =
    seller?.status === "approved" ? "bg-emerald-100 text-emerald-700" :
    seller?.status === "suspended" ? "bg-rose-100 text-rose-700" :
    "bg-amber-100 text-amber-700";

  return (
    <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl overflow-hidden border bg-gray-50">
            {console.log("logo",seller?.logoUrl)}
            {seller?.logoUrl
              ? <img src={`https://api.express48.com${seller.logoUrl}`} alt="logo" className="h-full w-full object-cover" />
              : <div className="h-full w-full grid place-items-center text-xs text-gray-400">LOGO</div>}
          </div>
          <div>
            <div className="text-sm font-semibold">{seller?.businessName || seller?.displayName || "דאשבורד מוכר"}</div>
            <div className="text-xs text-gray-500">{seller?.slug ? `/${seller.slug}` : ""}</div>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusTone}`}>
          {seller?.status || "pending"}
        </span>
      </div>
    </header>
  );
}
