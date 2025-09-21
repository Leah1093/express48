import React, { useEffect, useMemo, useRef, useState } from "react";
import DOMPurify from "dompurify";

// Helper: resolve absolute media URL from relative "/uploads/..." returned by the API
function resolveMediaUrl(url) {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url; // already absolute
    const base = "http://localhost:8080"?.replace(/\/$/, "") || "";
    if (base) return `${base}${url.startsWith("/") ? url : `/${url}`}`;
    return url.startsWith("/") ? url : `/${url}`;
}

import { useParams } from "react-router-dom";

// ---------- כוכבים ----------
function Stars({ value = 0, size = 18, className = "" }) {
    const full = Math.floor(value);
    const half = value - full >= 0.5;
    const total = 5;
    return (
        <div className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`דירוג ${value} מתוך 5`}>
            {Array.from({ length: total }).map((_, i) => {
                const filled = i < full || (i === full && half);
                return (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} className={filled ? "fill-yellow-400 stroke-yellow-500" : "fill-gray-200 stroke-gray-300"}>
                        <path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.786 1.4 8.159L12 18.896 4.666 23.156l1.4-8.159L.132 9.211l8.2-1.193z" />
                    </svg>
                );
            })}
        </div>
    );
}

// ---------- סרגל חלוקת דירוגים ----------
function RatingsBreakdown({ breakdown = {}, count = 0 }) {
    const total = Math.max(count || 0, 1);
    const rows = [5, 4, 3, 2, 1];
    return (
        <div className="space-y-2">
            {rows.map(star => {
                const value = breakdown?.[star] || 0;
                const percent = Math.round((value / total) * 100);
                return (
                    <div key={star} className="flex items-center gap-2">
                        <span className="w-8 text-sm text-gray-600">{star}★</span>
                        <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                            <div className="h-2 bg-yellow-400" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="w-10 text-sm text-gray-600 text-left">{value}</span>
                    </div>
                );
            })}
        </div>
    );
}

// ---------- באנר: תמונה | סליידר | וידאו ----------
function StoreBanner({ branding, name, showNameOverBanner, contact, appearance }) {
    const { bannerTypeStore, storeBanner, storeSlider = [], mobileBanner } = branding || {};
    const [index, setIndex] = useState(0);
    const isSlider = bannerTypeStore === "slider" && storeSlider?.length > 0;
    const isVideo = bannerTypeStore === "video" && storeBanner?.kind === "video";
    const isImage = bannerTypeStore === "static" && storeBanner?.url;

    // סליידר אוטומטי
    useEffect(() => {
        if (!isSlider) return;
        const id = setInterval(() => setIndex(i => (i + 1) % storeSlider.length), 5000);
        return () => clearInterval(id);
    }, [isSlider, storeSlider?.length]);

    return (
        <div className="relative w-full overflow-hidden rounded-2xl shadow">
            {/* מדבקת PREVIEW אם צריך (מוצג מחוץ לרכיב הזה בפועל, השארתי כאן דוגמה) */}
            {/* שכבת מדיה */}
            <div className="relative h-[240px] md:h-[360px] bg-gray-100">
                {isVideo && (
                    <video className="w-full h-full object-cover" src={resolveMediaUrl(storeBanner?.url)} autoPlay muted loop playsInline />
                )}
                {isImage && (
                    <img className="w-full h-full object-cover" src={resolveMediaUrl(storeBanner?.url)} alt={storeBanner?.alt || name} />
                )}
                {isSlider && (
                    <div className="w-full h-full">
                        {storeSlider.map((m, i) => (
                            <img key={i} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`} src={resolveMediaUrl(m.url)} alt={m.alt || `${name} ${i + 1}`} />
                        ))}
                    </div>
                )}

                {/* שם חנות על הבאנר אם נדרש */}
                {showNameOverBanner && (
                    <div className="absolute bottom-3 right-3 md:bottom-5 md:right-5 bg-white/85 backdrop-blur px-3 py-1.5 md:px-4 md:py-2 rounded-xl shadow text-gray-900">
                        <h1 className="text-base md:text-xl font-semibold truncate max-w-[70vw]">{name}</h1>
                    </div>
                )}

                {/* פרטי קשר ליד הלוגו (כאן מעל המדיה, את הלוגו מציגים מחוץ לבאנר בחפיפה) */}
                {contact && (
                    <div className="absolute top-3 left-3 md:top-4 md:left-4 flex items-center gap-3 bg-white/85 backdrop-blur px-3 py-1.5 rounded-xl shadow">
                        {contact.email && !appearance?.hideEmail && (
                            <a href={`mailto:${contact.email}`} className="text-sm md:text-base hover:underline">{contact.email}</a>
                        )}
                        {contact.phone && !appearance?.hidePhone && (
                            <a href={`tel:${contact.phone}`} className="text-sm md:text-base hover:underline">{contact.phone}</a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ---------- כרטיס מוצר פשוט ----------
function ProductCard({ p }) {
    return (
        <div className="rounded-2xl shadow hover:shadow-lg transition p-3 bg-white">
            <div className="aspect-[1/1] w-full bg-gray-100 rounded-xl overflow-hidden">
                {p?.image ? (
                    <img src={resolveMediaUrl(p.image)} alt={p.title || ""} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">אין תמונה</div>
                )}
            </div>
            <div className="mt-2">
                <div className="text-sm md:text-base font-medium line-clamp-2" title={p?.title}>{p?.title || "מוצר"}</div>
                {typeof p?.price === "number" && (
                    <div className="text-lg font-bold mt-1">₪{p.price.toLocaleString()}</div>
                )}
            </div>
        </div>
    );
}

// ---------- עמוד החנות ----------
export default function StorePublicPage() {
    const { slug } = useParams();
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState("products");
    const [products, setProducts] = useState([]);

    // שליפה מהשרת
    useEffect(() => {
        let mounted = true;
        async function load() {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(`http://localhost:8080/public/stores/${encodeURIComponent(slug)}`, { credentials: "include" });
                const json = await res.json();
                if (!mounted) return;
                if (!json?.ok) throw new Error(json?.error || "load failed");
                setStore(json.store);
            } catch (e) {
                if (mounted) setError(e.message || "load failed");
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => { mounted = false; };
    }, [slug]);

    // אופציונלי: מוצרים
    useEffect(() => {
        let mounted = true;
        async function loadProducts() {
            try {
                // אם יש לך API ייעודי – אפשר לשנות לכאן
                const res = await fetch(`/public/stores/${encodeURIComponent(slug)}/products`);
                if (!res.ok) return; // לא חובה
                const json = await res.json();
                if (!mounted) return;
                if (json?.ok && Array.isArray(json.products)) setProducts(json.products);
            } catch { }
        }
        loadProducts();
        return () => { mounted = false; };
    }, [slug]);

    const nameOnBanner = store?.appearance?.storeNamePosition === "over-banner";
    const nameInHeader = store?.appearance?.storeNamePosition === "header";

    // מידע לוגו ודירוגים ליד הבאנר
    const contactForBanner = useMemo(() => ({
        email: store?.contactEmail || store?.support?.email || "",
        phone: store?.phone || store?.support?.phone || "",
    }), [store]);

    if (loading) {
        return (
            <div dir="rtl" className="max-w-6xl mx-auto px-3 md:px-6 py-10">
                <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-gray-200 rounded w-1/3" />
                    <div className="h-64 bg-gray-200 rounded-2xl" />
                    <div className="h-16 bg-gray-200 rounded" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div dir="rtl" className="max-w-3xl mx-auto px-3 md:px-6 py-10 text-center text-red-600">שגיאה: {error}</div>
        );
    }

    if (!store) return null;

    const { branding = {}, rating = {}, appearance = {}, visibility, name } = store;

    return (
        <div dir="rtl" className="max-w-6xl mx-auto px-3 md:px-6 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    {nameInHeader && (
                        <h1 className="text-xl md:text-2xl font-bold truncate max-w-[60vw]">{name}</h1>
                    )}
                </div>
                {/* תגית PREVIEW אם לא פומבי */}
                {visibility === "preview" && (
                    <span className="inline-flex items-center gap-2 text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1 rounded-xl text-sm">
                        טיוטה
                    </span>
                )}
            </div>

            {/* Banner */}
            <StoreBanner
                branding={branding}
                name={name}
                showNameOverBanner={nameOnBanner}
                contact={contactForBanner}
                appearance={appearance}
            />

            {/* לוגו עגול שמונח מתחת לבאנר */}
            <div className="relative">
                <div className="-mt-8 md:-mt-10 flex items-center gap-3">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full ring-4 ring-white overflow-hidden shadow bg-white">
                        {branding?.logo?.url ? (
                            <img src={resolveMediaUrl(branding.logo.url)} alt={branding.logo.alt || name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">לוגו</div>
                        )}
                    </div>
                    {/* כוכבים תמיד מוצג גם אם 0 */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <Stars value={Number(rating?.avg || 0)} />
                            <span className="text-sm text-gray-600">({Number(rating?.count || 0).toLocaleString()})</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* טאבים */}
            <div className="mt-6 border-b border-gray-200">
                <nav className="flex gap-6 text-sm md:text-base">
                    {[
                        { key: "products", label: "מוצרים" },
                        { key: "about", label: "אודות" },
                        { key: "ratings", label: "דירוגים" },
                    ].map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`py-3 -mb-px border-b-2 transition ${tab === t.key ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-900"}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* תוכן טאבים */}
            <div className="mt-6">
                {tab === "products" && (
                    <section className="space-y-4">
                        {Array.isArray(products) && products.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                                {products.map((p, i) => <ProductCard key={p._id || i} p={p} />)}
                            </div>
                        ) : (
                            <div className="text-gray-500">אין מוצרים להצגה כרגע.</div>
                        )}
                    </section>
                )}


                {tab === "about" && (
                    <section className="space-y-6">
                        {/* אודות */}
                        {!appearance?.hideAbout && store?.description ? (
                            <div>
                                <h2 className="text-lg md:text-xl font-semibold mb-2">אודות</h2>
                                <div
                                    className="prose prose-sm md:prose lg:prose-lg rtl text-gray-800 leading-7"
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(store.description) }}
                                />
                            </div>
                        ) : (
                            <div className="text-gray-500">אין מידע אודות לשיתוף.</div>
                        )}

                        {/* כתובת – תוצג אם קיימת ולא מוסתרת */}
                        {store?.address && !appearance?.hideAddress && (
                            <div>
                                <h3 className="font-semibold mb-1">כתובת</h3>
                                <div className="text-gray-800">{store.address}</div>
                            </div>
                        )}

                        {/* שירות לקוחות */}
                        <div>
                            <h3 className="font-semibold mb-1">שירות לקוחות</h3>
                            <ul className="text-gray-800 space-y-1">
                                {store?.support?.email && !appearance?.hideEmail && (
                                    <li>אימייל: <a className="hover:underline" href={`mailto:${store.support.email}`}>{store.support.email}</a></li>
                                )}
                                {store?.support?.phone && !appearance?.hidePhone && (
                                    <li>טלפון: <a className="hover:underline" href={`tel:${store.support.phone}`}>{store.support.phone}</a></li>
                                )}
                                {store?.support?.whatsapp && (
                                    <li>וואטסאפ: <a className="hover:underline" href={store.support.whatsapp}>{store.support.whatsapp}</a></li>
                                )}
                                {store?.support?.hours && (
                                    <li>שעות פעילות: {store.support.hours}</li>
                                )}
                                {store?.support?.note && (
                                    <li>הערה: {store.support.note}</li>
                                )}
                            </ul>
                        </div>
                    </section>
                )}


                {tab === "ratings" && (
                    <section className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 p-4 rounded-2xl bg-white shadow">
                            <div className="text-center">
                                <div className="text-4xl font-bold">{Number(rating?.avg || 0).toFixed(1)}</div>
                                <Stars value={Number(rating?.avg || 0)} className="justify-center mt-1" />
                                <div className="text-sm text-gray-600 mt-1">על סמך {Number(rating?.count || 0).toLocaleString()} דירוגים</div>
                            </div>
                            <div className="mt-4">
                                <RatingsBreakdown breakdown={rating?.breakdown} count={rating?.count} />
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            {/* רשימת דירוגים מפורטת – כשיהיה API נחבר. כרגע מצב ריק אלגנטי. */}
                            {Number(rating?.count || 0) === 0 ? (
                                <div className="text-gray-500">אין עדיין דירוגים. היו הראשונים לדרג.</div>
                            ) : (
                                <div className="text-gray-500">כאן יוצגו הביקורות המלאות כאשר נוסיף API לרשימת דירוגים.</div>
                            )}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
