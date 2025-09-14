import { useOutletContext } from "react-router-dom";

type Media = { kind: "image" | "video"; url: string; alt?: string };
type StoreView = {
  name: string;
  description?: string;
  contactEmail?: string;
  phone?: string;
  appearance?: {
    hideEmail?: boolean;
    hidePhone?: boolean;
    hideAbout?: boolean;
  };
  branding?: {
    listBanner?: Media | null;
    listBannerType?: "static" | "video";
  };
};

export default function StoreAbout() {
  const { store } = useOutletContext<{ store: StoreView }>();

  if (store.appearance?.hideAbout) {
    return (
      <div className="rounded-xl border bg-white p-4 text-gray-600">
        אזור האודות הוגדר כמוסתר.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* תוכן */}
      <section className="md:col-span-2 rounded-xl border bg-white p-4">
        <h2 className="mb-2 text-lg font-semibold">אודות המוכר</h2>
        <p className="whitespace-pre-wrap text-gray-800">
          {store.description || "אין תיאור זמין."}
        </p>
      </section>

      {/* פרטי קשר/תמונה משנית */}
      <aside className="rounded-xl border bg-white p-4">
        <h3 className="mb-2 text-lg font-semibold">פרטי קשר</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          {!store.appearance?.hideEmail && store.contactEmail && (
            <li>
              מייל:{" "}
              <a href={`mailto:${store.contactEmail}`} className="underline">
                {store.contactEmail}
              </a>
            </li>
          )}
          {!store.appearance?.hidePhone && store.phone && <li>טלפון: {store.phone}</li>}
        </ul>

        {/* באנר ליסט אופציונלי */}
        {store.branding?.listBanner && (
          <div className="mt-4 overflow-hidden rounded-lg">
            {store.branding.listBannerType === "video" ? (
              <video
                className="h-full w-full object-cover"
                src={store.branding.listBanner.url}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img
                src={store.branding.listBanner.url}
                alt={store.branding.listBanner.alt || ""}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
