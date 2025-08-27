// import { useEffect, useState, useMemo, useCallback } from "react";
// import StoreSettingsForm from "./StoreSettingsForm.jsx";
// import { getMyStore, saveMyStore, updateMySlug, publishStore } from "./storeApi.js";

// // ניקוי לפני שמירה
// const isEmpty = (v) => v == null || v === "";
// const normalizeMedia = (m) => {
//   if (!m || isEmpty(m.url) || String(m.url).startsWith("blob:")) return null;
//   return { kind: m.kind === "video" ? "video" : "image", url: String(m.url).trim(), alt: (m.alt || "").trim() };
// };
// function normalizeStorePayload(raw) {
//   const out = structuredClone(raw);
//   out.logo = normalizeMedia(out.logo) || undefined;
//   out.storeBanner = normalizeMedia(out.storeBanner) || undefined;
//   out.mobileBanner = normalizeMedia(out.mobileBanner) || undefined;
//   out.listBanner = normalizeMedia(out.listBanner) || undefined;
//   if (out.contactEmail) out.contactEmail = out.contactEmail.toLowerCase().trim();
//   if (out.support?.email) out.support.email = out.support.email.toLowerCase().trim();
//   if (isEmpty(out.description)) delete out.description;
//   if (out.policies) {
//     for (const k of ["about", "shipping", "returns", "privacy", "terms"]) {
//       if (isEmpty(out.policies[k])) delete out.policies[k];
//     }
//     if (!Object.keys(out.policies).length) delete out.policies;
//   }
//   return out;
// }

// export default function StoreSettings() {
//   const [initial, setInitial] = useState(undefined);
//   const [saving, setSaving] = useState(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         const store = await getMyStore();
//         if (!alive) return;
//         setInitial(store ?? undefined);
//       } catch (e) {
//         console.error(e);
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => { alive = false; };
//   }, []);

//   // מזהה יציב למניעת רה-מונט של הטופס
//   const memoInitial = useMemo(
//     () => initial || undefined,
//     [initial && (initial._id || initial.id) ? (initial._id || initial.id) : initial]
//   );

//   const onSubmit = useCallback(async (payload) => {
//     try {
//       setSaving(true);
//       const clean = normalizeStorePayload(payload);
//       const saved = await saveMyStore(clean);
//       setInitial(saved ?? undefined);
//       alert("נשמר בהצלחה");
//     } catch (e) {
//       console.error(e);
//       alert("שמירה נכשלה");
//     } finally {
//       setSaving(false);
//     }
//   }, []);

//   // סלוג – עדכון אוטומטי מהשם
//   const onAutoSlug = useCallback(async () => {
//     try {
//       const res = await updateMySlug();
//       // ה־API מחזיר { success, slug } או את ה־store — נתמוך בשניהם:
//       if (res?.slug && initial) {
//         setInitial({ ...initial, slug: res.slug, slugChanged: true });
//       } else if (res?._id || res?.id) {
//         setInitial(res);
//       } else {
//         // גיבוי: רענון מלא
//         const store = await getMyStore();
//         setInitial(store ?? undefined);
//       }
//       alert("הסלוג עודכן אוטומטית מהשם");
//     } catch (e) {
//       alert(e?.response?.data?.error || "עדכון סלוג נכשל");
//     }
//   }, [initial]);

//   // סלוג – מותאם ידנית (שומר slug ידני; יכבד את מגבלת פעם אחת/טיוטה בצד השרת)
//   const onCustomSlug = useCallback(async (customSlug) => {
//     try {
//       const saved = await saveMyStore({ slug: String(customSlug || "").trim() });
//       setInitial(saved ?? undefined);
//       alert("הסלוג נשמר");
//     } catch (e) {
//       alert(e?.response?.data?.error || "שמירת סלוג נכשלה");
//     }
//   }, []);

//   // פרסום חנות
//   const onPublish = useCallback(async () => {
//     try {
//       const saved = await publishStore();
//       setInitial(saved ?? undefined);
//       alert("החנות פורסמה");
//     } catch (e) {
//       alert(e?.response?.data?.error || "פרסום החנות נכשל");
//     }
//   }, []);

//   if (loading) return <div className="p-6">טוען…</div>;

//   const status = initial?.status || "draft";
//   const isDraft = status === "draft";

//   return (
//     <div className="max-w-5xl mx-auto p-6 space-y-4">
//       <h1 className="text-2xl font-bold flex items-center gap-3">
//         הגדרות חנות
//         <span className={`px-2 py-1 text-xs rounded ${isDraft ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
//           {isDraft ? "טיוטה" : "פעילה"}
//         </span>
//         {isDraft && (
//           <button
//             type="button"
//             onClick={onPublish}
//             className="ml-2 px-3 py-1.5 text-xs rounded bg-green-700 text-white hover:bg-green-600"
//           >
//             פרסום חנות
//           </button>
//         )}
//       </h1>

//       <StoreSettingsForm
//         initial={memoInitial}
//         onSubmit={onSubmit}
//         submitting={saving}
//         isDraft={isDraft}
//         onAutoSlug={onAutoSlug}
//         onCustomSlug={onCustomSlug}
//       />
//     </div>
//   );
// }



import { useEffect, useState, useMemo, useCallback } from "react";
import StoreSettingsForm from "./StoreSettingsForm.jsx";
import { getMyStore, saveMyStore, updateMySlug, publishStore } from "./storeApi.js";

// עזרי ניקוי לפני שמירה
const isEmpty = (v) => v == null || v === "";
const normalizeMedia = (m) => {
  if (!m || isEmpty(m.url) || String(m.url).startsWith("blob:")) return null;
  return { kind: m.kind === "video" ? "video" : "image", url: String(m.url).trim(), alt: (m.alt || "").trim() };
};
function normalizeStorePayload(raw) {
  const out = structuredClone(raw);
  // לא לאפשר בשמירה רגילה:
  delete out.slug; delete out.slugChanged; delete out.status;

  out.logo = normalizeMedia(out.logo) || undefined;
  out.storeBanner = normalizeMedia(out.storeBanner) || undefined;
  out.mobileBanner = normalizeMedia(out.mobileBanner) || undefined;
  out.listBanner = normalizeMedia(out.listBanner) || undefined;

  if (out.contactEmail) out.contactEmail = out.contactEmail.toLowerCase().trim();
  if (out.support?.email) out.support.email = out.support.email.toLowerCase().trim();
  if (isEmpty(out.description)) delete out.description;

  if (out.policies) {
    for (const k of ["about", "shipping", "returns", "privacy", "terms"]) {
      if (isEmpty(out.policies[k])) delete out.policies[k];
    }
    if (!Object.keys(out.policies).length) delete out.policies;
  }
  return out;
}

export default function StoreSettings() {
  const [initial, setInitial] = useState(undefined);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const store = await getMyStore();
        if (!alive) return;
        setInitial(store ?? undefined);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const memoInitial = useMemo(
    () => initial || undefined,
    [initial && (initial._id || initial.id) ? (initial._id || initial.id) : initial]
  );

  const onSubmit = useCallback(async (payload) => {
    try {
      setSaving(true);
      const clean = normalizeStorePayload(payload);
      const saved = await saveMyStore(clean);
      setInitial(saved ?? undefined);
      alert("נשמר בהצלחה");
    } catch (e) {
      console.error(e);
      alert("שמירה נכשלה");
    } finally {
      setSaving(false);
    }
  }, []);



  const onCustomSlug = useCallback(async (customSlug) => {
    try {
      const res = await updateMySlug(String(customSlug || "").trim());
      if (res?.slug && initial) setInitial({ ...initial, slug: res.slug, slugChanged: true });
      else if (res?._id || res?.id) setInitial(res);
      else setInitial(await getMyStore());
      alert("הסלוג נשמר");
    } catch (e) { alert(e?.response?.data?.error || "שמירת סלוג נכשלה"); }
  }, [initial]);

  const onPublish = useCallback(async () => {
    try {
      const saved = await publishStore();
      setInitial(saved ?? undefined);
      alert("החנות פורסמה");
    } catch (e) { alert(e?.response?.data?.error || "פרסום החנות נכשל"); }
  }, []);

  if (loading) return <div className="p-6">טוען…</div>;

  const status = initial?.status || "draft";
  const isDraft = status === "draft";

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold flex items-center gap-3">
        הגדרות חנות
        <span className={`px-2 py-1 text-xs rounded ${isDraft ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
          {isDraft ? "טיוטה" : "פעילה"}
        </span>
        {isDraft && (
          <button type="button" onClick={onPublish} className="ml-2 px-3 py-1.5 text-xs rounded bg-green-700 text-white hover:bg-green-600">
            פרסום חנות
          </button>
        )}
      </h1>

      <StoreSettingsForm
        initial={memoInitial}
        onSubmit={onSubmit}
        submitting={saving}
        isDraft={isDraft}
        onCustomSlug={onCustomSlug}
      />
    </div>
  );
}
