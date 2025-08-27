// // import { useEffect, useRef, useState } from "react";
// // import { useForm, Controller } from "react-hook-form";
// // import { z } from "zod";
// // import { zodResolver } from "@hookform/resolvers/zod";
// // import SettingsTabs from "./SettingsTabs.jsx";
// // import UploadMedia from "./UploadMedia.jsx";
// // import UploadGallery from "./UploadGallery.jsx";
// // import RichTextEditor from "./RichTextEditor.jsx";
// // import { uploadStoreMedia } from "./storeApi.js";

// // // --- סכימות אימות ---
// // // מרככים את הולידציית ה-URL כך שלא תחסום blob:/data:/נתיב יחסי
// // const mediaUrlSchema = z
// //   .string()
// //   .trim()
// //   .optional()
// //   .transform((s) => s ?? "")
// //   .refine(
// //     (s) =>
// //       s === "" ||
// //       /^https?:\/\//i.test(s) ||   // http/https
// //       s.startsWith("/") ||          // נתיב יחסי מהשורש
// //       s.startsWith("blob:") ||      // בחירת קובץ מקומי
// //       s.startsWith("data:"),        // data-uri
// //     "URL לא תקין"
// //   );

// // const mediaSoftSchema = z.object({
// //   kind: z.enum(["image", "video"]).optional(),
// //   url: mediaUrlSchema, // <-- כאן השינוי
// //   alt: z.string().optional(),
// // });

// // const schema = z.object({
// //   name: z.string().min(2, "שם חנות קצר מדי").trim(),
// //   contactEmail: z.string().email("אימייל לא תקין").transform((s) => s.toLowerCase().trim()),
// //   phone: z.string().trim().optional(),
// //   support: z
// //     .object({
// //       email: z.string().email("אימייל לא תקין").transform((s) => s.toLowerCase().trim()).optional().or(z.literal("")),
// //       phone: z.string().trim().optional(),
// //       whatsapp: z.string().trim().optional(),
// //       hours: z.string().trim().optional(),
// //       note: z.string().trim().optional(),
// //     })
// //     .optional()
// //     .default({}),
// //   logo: mediaSoftSchema.optional(),
// //   bannerTypeStore: z.enum(["static", "video", "slider"]).optional().default("static"),
// //   storeBanner: mediaSoftSchema.optional(),
// //   mobileBanner: mediaSoftSchema.optional(),
// //   storeSlider: z.array(mediaSoftSchema).optional().default([]),
// //   bannerTypeList: z.enum(["static", "video"]).optional().default("static"),
// //   listBanner: mediaSoftSchema.optional(),
// //   description: z.string().optional(),
// //   appearance: z
// //     .object({
// //       storeNamePosition: z.enum(["header", "over-banner", "hidden"]).optional().default("header"),
// //       productsPerPage: z.coerce.number().int().min(1).max(1000).optional().default(24),
// //       hideEmail: z.boolean().optional().default(false),
// //       hidePhone: z.boolean().optional().default(false),
// //       hideAddress: z.boolean().optional().default(false),
// //       hideAbout: z.boolean().optional().default(false),
// //     })
// //     .optional()
// //     .default({}),
// //   policies: z
// //     .object({
// //       about: z.string().optional(),
// //       shipping: z.string().optional(),
// //       returns: z.string().optional(),
// //       privacy: z.string().optional(),
// //       terms: z.string().optional(),
// //     })
// //     .optional()
// //     .default({}),
// // });

// // export default function StoreSettingsForm({ initial, onSubmit, submitting }) {
// //   const didInitRef = useRef(false);

// //   const {
// //     register,
// //     handleSubmit,
// //     control,
// //     reset,
// //     formState: { errors },
// //     getValues,
// //   } = useForm({
// //     resolver: zodResolver(schema),
// //     mode: "onSubmit",
// //     shouldFocusError: true,
// //     defaultValues: initial || {
// //       name: "",
// //       contactEmail: "",
// //       phone: "",
// //       support: { email: "", phone: "", whatsapp: "", hours: "", note: "" },
// //       logo: { kind: "image", url: "", alt: "" },
// //       bannerTypeStore: "static",
// //       storeBanner: { kind: "image", url: "", alt: "" },
// //       mobileBanner: { kind: "image", url: "", alt: "" },
// //       storeSlider: [],
// //       bannerTypeList: "static",
// //       listBanner: { kind: "image", url: "", alt: "" },
// //       description: "",
// //       appearance: {
// //         storeNamePosition: "header",
// //         productsPerPage: 24,
// //         hideEmail: false,
// //         hidePhone: false,
// //         hideAddress: false,
// //         hideAbout: false,
// //       },
// //       policies: { about: "", shipping: "", returns: "", privacy: "", terms: "" },
// //     },
// //   });

// //   // --- ללא watch: מצב מקומי רק למה שמשפיע על ה-UI ---
// //   const [bannerTypeStore, setBannerTypeStore] = useState(initial?.bannerTypeStore || "static");
// //   const [bannerTypeList, setBannerTypeList] = useState(initial?.bannerTypeList || "static");

// //   // reset חד-פעמי כאשר מגיע initial מהשרת + סנכרון המצבים הוויזואליים
// //   useEffect(() => {
// //     if (!initial) return;
// //     if (didInitRef.current) return;
// //     reset(initial);
// //     setBannerTypeStore(initial.bannerTypeStore || "static");
// //     setBannerTypeList(initial.bannerTypeList || "static");
// //     didInitRef.current = true;
// //   }, [initial, reset]);

// //   const storeBannerKinds = bannerTypeStore === "video" ? ["video"] : ["image"];
// //   const mobileBannerKinds = bannerTypeStore === "video" ? ["video"] : ["image"];
// //   const listBannerKinds = bannerTypeList === "video" ? ["video"] : ["image"];

// //   const Section = ({ title, children }) => (
// //     <section className="bg-white p-4 rounded-xl shadow space-y-3">
// //       <h3 className="font-bold text-lg">{title}</h3>
// //       {children}
// //     </section>
// //   );

// //   const onError = (errs) => {
// //     // להצגה מהירה אם עדיין יש משהו שחוסם
// //     console.log("RHF validation errors:", errs);
// //     if (errs.name || errs.contactEmail) alert("אנא מלאי שם חנות ואימייל תקין");
// //   };

// //   // העלאת מדיה בבקשה אחת לשרת – snapshot של הערכים בלי רינדור
// //   const handleUploadMedia = async () => {
// //     const v = getValues();

// //     // איסוף ה-File-ים שנבחרו בקומפוננטות (UploadMedia/UploadGallery שומרים _file)
// //     const files = {
// //       logo: v?.logo?._file,
// //       storeBanner: v?.storeBanner?._file,
// //       mobileBanner: v?.mobileBanner?._file,
// //       listBanner: v?.listBanner?._file,
// //       slider: Array.isArray(v?.storeSlider) ? v.storeSlider.map((m) => m?._file).filter(Boolean) : [],
// //     };

// //     const anyFile =
// //       !!files.logo ||
// //       !!files.storeBanner ||
// //       !!files.mobileBanner ||
// //       !!files.listBanner ||
// //       (files.slider && files.slider.length > 0);

// //     if (!anyFile) {
// //       alert("לא נבחרו קבצים להעלאה.");
// //       return;
// //     }

// //     try {
// //       const res = await uploadStoreMedia({
// //         bannerTypeStore: v?.bannerTypeStore || "static",
// //         bannerTypeList: v?.bannerTypeList || "static",
// //         replaceSlider: false, // שנה ל-true אם תרצי להחליף לחלוטין את הסליידר
// //         files,
// //       });

// //       if (res?.store) {
// //         reset(res.store);
// //         setBannerTypeStore(res.store.bannerTypeStore || "static");
// //         setBannerTypeList(res.store.bannerTypeList || "static");
// //         alert("המדיה הועלתה ונשמרה בהצלחה");
// //       } else {
// //         alert("העלאת המדיה הצליחה");
// //       }
// //     } catch (e) {
// //       console.error(e);
// //       alert("העלאת מדיה נכשלה");
// //     }
// //   };

// //   // חיבורי register לשדות שמנהלים גם UI מקומי
// //   const bannerTypeStoreReg = register("bannerTypeStore");
// //   const bannerTypeListReg = register("bannerTypeList");

// //   return (
// //     <form
// //       onSubmit={handleSubmit((data) => {
// //         console.log("✔ handleSubmit OK, calling parent onSubmit with:", data);
// //         onSubmit?.(data);
// //       }, onError)}
// //       className="space-y-6"
// //       noValidate
// //     >
// //       {/* השארת הבלוק קבוע כדי לא להזיז DOM ולגרום לבריחת פוקוס */}
// //       <div
// //         className={`p-2 rounded transition ${
// //           errors.name || errors.contactEmail ? "bg-red-50 text-red-700" : "invisible"
// //         }`}
// //       >
// //         יש להשלים שם חנות ואימייל תקין.
// //       </div>

// //       <SettingsTabs labels={["כללי", "שירות לקוחות", "מיתוג ותיאור", "הגדרת נראות"]} initialActive={0}>
// //         {/* טאב: כללי */}
// //         <div className="grid md:grid-cols-2 gap-6">
// //           <Section title="פרטים כלליים">
// //             <div className="grid gap-4">
// //               <div>
// //                 <div className="text-sm mb-1">שם החנות</div>
// //                 <input className="border rounded p-2 w-full" autoComplete="organization" {...register("name")} />
// //                 {errors.name?.message && <div className="text-xs text-red-600 mt-1">{errors.name.message}</div>}
// //               </div>

// //               <div>
// //                 <div className="text-sm mb-1">אימייל החנות</div>
// //                 <input type="email" autoComplete="email" className="border rounded p-2 w-full" {...register("contactEmail")} />
// //                 {errors.contactEmail?.message && (
// //                   <div className="text-xs text-red-600 mt-1">{errors.contactEmail.message}</div>
// //                 )}
// //               </div>

// //               <div>
// //                 <div className="text-sm mb-1">טלפון</div>
// //                 <input autoComplete="tel" className="border rounded p-2 w-full" {...register("phone")} />
// //                 {errors.phone?.message && <div className="text-xs text-red-600 mt-1">{errors.phone.message}</div>}
// //               </div>
// //             </div>
// //           </Section>
// //         </div>

// //         {/* טאב: שירות לקוחות */}
// //         <div className="grid md:grid-cols-2 gap-6">
// //           <Section title="שירות לקוחות">
// //             <div className="grid gap-4">
// //               <div>
// //                 <div className="text-sm mb-1">אימייל תמיכה</div>
// //                 <input type="email" autoComplete="email" className="border rounded p-2 w-full" {...register("support.email")} />
// //               </div>
// //               <div>
// //                 <div className="text-sm mb-1">טלפון תמיכה</div>
// //                 <input autoComplete="tel" className="border rounded p-2 w-full" {...register("support.phone")} />
// //               </div>
// //               <div>
// //                 <div className="text-sm mb-1">WhatsApp</div>
// //                 <input autoComplete="off" className="border rounded p-2 w-full" {...register("support.whatsapp")} />
// //               </div>
// //               <div>
// //                 <div className="text-sm mb-1">שעות פעילות</div>
// //                 <input
// //                   placeholder="א-ה 09:00-17:00"
// //                   autoComplete="off"
// //                   className="border rounded p-2 w-full"
// //                   {...register("support.hours")}
// //                 />
// //               </div>
// //               <div>
// //                 <div className="text-sm mb-1">הערה</div>
// //                 <input autoComplete="off" className="border rounded p-2 w-full" {...register("support.note")} />
// //               </div>
// //             </div>
// //           </Section>
// //         </div>

// //         {/* טאב: מיתוג ותיאור */}
// //         <div className="space-y-4">
// //           <Section title="לוגו ובאנרים">
// //             <div className="grid md:grid-cols-2 gap-6">
// //               <Controller
// //                 control={control}
// //                 name="logo"
// //                 render={({ field }) => (
// //                   <UploadMedia
// //                     label="לוגו החנות"
// //                     value={field.value}
// //                     onChange={field.onChange}
// //                     kinds={["image"]}
// //                     accept="auto"
// //                     hideKindSelector
// //                   />
// //                 )}
// //               />
// //               <div className="space-y-2">
// //                 <div className="text-sm mb-1">סוג באנר חנות</div>
// //                 <select
// //                   className="border rounded p-2 w-full"
// //                   {...bannerTypeStoreReg}
// //                   onChange={(e) => {
// //                     bannerTypeStoreReg.onChange(e);
// //                     setBannerTypeStore(e.target.value);
// //                   }}
// //                 >
// //                   <option value="static">תמונה סטטית</option>
// //                   <option value="video">וידאו</option>
// //                   <option value="slider">סליידר</option>
// //                 </select>
// //               </div>
// //             </div>

// //             {bannerTypeStore === "slider" ? (
// //               <Controller
// //                 control={control}
// //                 name="storeSlider"
// //                 render={({ field }) => (
// //                   <UploadGallery label="גלריית סליידר" value={field.value} onChange={field.onChange} />
// //                 )}
// //               />
// //             ) : (
// //               <div className="grid md:grid-cols-2 gap-6 mt-4">
// //                 <Controller
// //                   control={control}
// //                   name="storeBanner"
// //                   render={({ field }) => (
// //                     <UploadMedia
// //                       label="באנר חנות"
// //                       value={field.value}
// //                       onChange={field.onChange}
// //                       kinds={storeBannerKinds}
// //                       accept="auto"
// //                       hideKindSelector={storeBannerKinds.length === 1}
// //                     />
// //                   )}
// //                 />
// //                 <Controller
// //                   control={control}
// //                   name="mobileBanner"
// //                   render={({ field }) => (
// //                     <UploadMedia
// //                       label="באנר נייד"
// //                       value={field.value}
// //                       onChange={field.onChange}
// //                       kinds={mobileBannerKinds}
// //                       accept="auto"
// //                       hideKindSelector={mobileBannerKinds.length === 1}
// //                     />
// //                   )}
// //                 />
// //               </div>
// //             )}

// //             <div className="grid md:grid-cols-2 gap-6 mt-4">
// //               <div className="text-sm mb-1">סוג באנר רשימת חנויות</div>
// //               <select
// //                 className="border rounded p-2 w-full"
// //                 {...bannerTypeListReg}
// //                 onChange={(e) => {
// //                   bannerTypeListReg.onChange(e);
// //                   setBannerTypeList(e.target.value);
// //                 }}
// //               >
// //                 <option value="static">תמונה סטטית</option>
// //                 <option value="video">וידאו</option>
// //               </select>
// //               <Controller
// //                 control={control}
// //                 name="listBanner"
// //                 render={({ field }) => (
// //                   <UploadMedia
// //                     label="באנר רשימת חנות"
// //                     value={field.value}
// //                     onChange={field.onChange}
// //                     kinds={listBannerKinds}
// //                     accept="auto"
// //                     hideKindSelector={listBannerKinds.length === 1}
// //                   />
// //                 )}
// //               />
// //             </div>
// //           </Section>

// //           <Section title="תיאור החנות">
// //             <Controller
// //               control={control}
// //               name="description"
// //               render={({ field }) => (
// //                 <RichTextEditor
// //                   value={field.value}
// //                   onChange={field.onChange}
// //                   onAddMedia={() => {
// //                     const url = window.prompt("הדבק URL של תמונה/וידאו:");
// //                     if (!url) return;
// //                     field.onChange(`${field.value || ""}\n<p><img src="${url}" alt="media" /></p>`);
// //                   }}
// //                 />
// //               )}
// //             />
// //           </Section>
// //         </div>

// //         {/* טאב: הגדרת נראות */}
// //         <Section title="הגדרת נראות חנות">
// //           <div className="grid md:grid-cols-2 gap-6">
// //             <div>
// //               <div className="text-sm mb-1">Store Name Position</div>
// //               <select className="border rounded p-2 w-full" {...register("appearance.storeNamePosition")}>
// //                 <option value="header">At Header</option>
// //                 <option value="over-banner">Over Banner</option>
// //                 <option value="hidden">Hidden</option>
// //               </select>
// //             </div>

// //             <div>
// //               <div className="text-sm mb-1">Products per page</div>
// //               <input
// //                 type="number"
// //                 className="border rounded p-2 w-full"
// //                 {...register("appearance.productsPerPage", { valueAsNumber: true })}
// //               />
// //             </div>

// //             <label className="flex items-center gap-2">
// //               <input type="checkbox" className="h-5 w-5" {...register("appearance.hideEmail")} />
// //               <span>הסתר אימייל מהחנות</span>
// //             </label>
// //             <label className="flex items-center gap-2">
// //               <input type="checkbox" className="h-5 w-5" {...register("appearance.hidePhone")} />
// //               <span>הסתר את הטלפון מהחנות</span>
// //             </label>
// //             <label className="flex items-center gap-2">
// //               <input type="checkbox" className="h-5 w-5" {...register("appearance.hideAddress")} />
// //               <span>הסתר כתובת מהחנות</span>
// //             </label>
// //             <label className="flex items-center gap-2">
// //               <input type="checkbox" className="h-5 w-5" {...register("appearance.hideAbout")} />
// //               <span>הסתר את אודות מהחנות</span>
// //             </label>
// //           </div>
// //         </Section>
// //       </SettingsTabs>

// //       {/* כפתורים למטה – שניים: שמירת פרטים (JSON) + העלאת מדיה (קבצים) */}
// //       <div className="flex flex-col sm:flex-row gap-3 justify-end">
// //         <button
// //           type="submit"
// //           disabled={submitting}
// //           className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 disabled:opacity-60"
// //         >
// //           {submitting ? "שומר…" : "שמירת פרטים"}
// //         </button>

// //         <button
// //           type="button"
// //           onClick={handleUploadMedia}
// //           className="bg-teal-700 text-white px-4 py-2 rounded hover:bg-teal-600"
// //         >
// //           העלאת מדיה
// //         </button>

// //       </div>
// //     </form>
// //   );
// // }






// import { useEffect, useRef, useState } from "react";
// import { useForm, Controller } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import SettingsTabs from "./SettingsTabs.jsx";
// import UploadMedia from "./UploadMedia.jsx";
// import UploadGallery from "./UploadGallery.jsx";
// import RichTextEditor from "./RichTextEditor.jsx";
// import { uploadStoreMedia } from "./storeApi.js";

// // סכימות
// const mediaUrlSchema = z.string().trim().optional().transform((s) => s ?? "").refine(
//   (s) =>
//     s === "" ||
//     /^https?:\/\//i.test(s) ||
//     s.startsWith("/") ||
//     s.startsWith("blob:") ||
//     s.startsWith("data:"),
//   "URL לא תקין"
// );
// const mediaSoftSchema = z.object({
//   kind: z.enum(["image", "video"]).optional(),
//   url: mediaUrlSchema,
//   alt: z.string().optional(),
// });
// const schema = z.object({
//   name: z.string().min(2, "שם חנות קצר מדי").trim(),
//   contactEmail: z.string().email("אימייל לא תקין").transform((s) => s.toLowerCase().trim()),
//   phone: z.string().trim().optional(),
//   support: z.object({
//     email: z.string().email("אימייל לא תקין").transform((s) => s.toLowerCase().trim()).optional().or(z.literal("")),
//     phone: z.string().trim().optional(),
//     whatsapp: z.string().trim().optional(),
//     hours: z.string().trim().optional(),
//     note: z.string().trim().optional(),
//   }).optional().default({}),
//   logo: mediaSoftSchema.optional(),
//   bannerTypeStore: z.enum(["static", "video", "slider"]).optional().default("static"),
//   storeBanner: mediaSoftSchema.optional(),
//   mobileBanner: mediaSoftSchema.optional(),
//   storeSlider: z.array(mediaSoftSchema).optional().default([]),
//   bannerTypeList: z.enum(["static", "video"]).optional().default("static"),
//   listBanner: mediaSoftSchema.optional(),
//   description: z.string().optional(),
//   appearance: z.object({
//     storeNamePosition: z.enum(["header", "over-banner", "hidden"]).optional().default("header"),
//     productsPerPage: z.coerce.number().int().min(1).max(1000).optional().default(24),
//     hideEmail: z.boolean().optional().default(false),
//     hidePhone: z.boolean().optional().default(false),
//     hideAddress: z.boolean().optional().default(false),
//     hideAbout: z.boolean().optional().default(false),
//   }).optional().default({}),
//   policies: z.object({
//     about: z.string().optional(),
//     shipping: z.string().optional(),
//     returns: z.string().optional(),
//     privacy: z.string().optional(),
//     terms: z.string().optional(),
//   }).optional().default({}),
//   // שדות מידע נוספים לתצוגת לשונית סלוג (לא מחייבים ולידציה קשיחה)
//   slug: z.string().optional(),
//   status: z.string().optional(),
//   slugChanged: z.boolean().optional(),
// });

// export default function StoreSettingsForm({
//   initial,
//   onSubmit,
//   submitting,
//   isDraft,
//   onAutoSlug,   // פונקציה מהורה – עדכון סלוג אוטומטי
//   onCustomSlug, // פונקציה מהורה – שמירת סלוג ידנית
// }) {
//   const didInitRef = useRef(false);

//   const {
//     register,
//     handleSubmit,
//     control,
//     reset,
//     formState: { errors },
//     getValues,
//     setValue,
//   } = useForm({
//     resolver: zodResolver(schema),
//     mode: "onSubmit",
//     shouldFocusError: true,
//     defaultValues: initial || {
//       name: "",
//       contactEmail: "",
//       phone: "",
//       support: { email: "", phone: "", whatsapp: "", hours: "", note: "" },
//       logo: { kind: "image", url: "", alt: "" },
//       bannerTypeStore: "static",
//       storeBanner: { kind: "image", url: "", alt: "" },
//       mobileBanner: { kind: "image", url: "", alt: "" },
//       storeSlider: [],
//       bannerTypeList: "static",
//       listBanner: { kind: "image", url: "", alt: "" },
//       description: "",
//       appearance: {
//         storeNamePosition: "header",
//         productsPerPage: 24,
//         hideEmail: false,
//         hidePhone: false,
//         hideAddress: false,
//         hideAbout: false,
//       },
//       policies: { about: "", shipping: "", returns: "", privacy: "", terms: "" },
//       slug: initial?.slug || "",
//       status: initial?.status || "draft",
//       slugChanged: !!initial?.slugChanged,
//     },
//   });

//   const [bannerTypeStore, setBannerTypeStore] = useState(initial?.bannerTypeStore || "static");
//   const [bannerTypeList, setBannerTypeList] = useState(initial?.bannerTypeList || "static");

//   useEffect(() => {
//     if (!initial) return;
//     if (didInitRef.current) return;
//     reset(initial);
//     setBannerTypeStore(initial.bannerTypeStore || "static");
//     setBannerTypeList(initial.bannerTypeList || "static");
//     didInitRef.current = true;
//   }, [initial, reset]);

//   const storeBannerKinds = bannerTypeStore === "video" ? ["video"] : ["image"];
//   const mobileBannerKinds = bannerTypeStore === "video" ? ["video"] : ["image"];
//   const listBannerKinds = bannerTypeList === "video" ? ["video"] : ["image"];

//   const Section = ({ title, children }) => (
//     <section className="bg-white p-4 rounded-xl shadow space-y-3">
//       <h3 className="font-bold text-lg">{title}</h3>
//       {children}
//     </section>
//   );

//   const onError = (errs) => {
//     if (errs.name || errs.contactEmail) alert("אנא מלאי שם חנות ואימייל תקין");
//   };

//   const handleUploadMedia = async () => {
//     const v = getValues();
//     const files = {
//       logo: v?.logo?._file,
//       storeBanner: v?.storeBanner?._file,
//       mobileBanner: v?.mobileBanner?._file,
//       listBanner: v?.listBanner?._file,
//       slider: Array.isArray(v?.storeSlider) ? v.storeSlider.map((m) => m?._file).filter(Boolean) : [],
//     };
//     const anyFile =
//       !!files.logo ||
//       !!files.storeBanner ||
//       !!files.mobileBanner ||
//       !!files.listBanner ||
//       (files.slider && files.slider.length > 0);
//     if (!anyFile) return alert("לא נבחרו קבצים להעלאה.");

//     try {
//       const res = await uploadStoreMedia({
//         bannerTypeStore: v?.bannerTypeStore || "static",
//         bannerTypeList: v?.bannerTypeList || "static",
//         replaceSlider: false,
//         files,
//       });
//       if (res?.store) {
//         reset(res.store);
//         setBannerTypeStore(res.store.bannerTypeStore || "static");
//         setBannerTypeList(res.store.bannerTypeList || "static");
//       }
//       alert("המדיה הועלתה ונשמרה");
//     } catch (e) {
//       console.error(e);
//       alert("העלאת מדיה נכשלה");
//     }
//   };

//   const bannerTypeStoreReg = register("bannerTypeStore");
//   const bannerTypeListReg = register("bannerTypeList");
//   console.log("initial", initial)
//   // לשונית סלוג – מתן יכולת עריכה רק אם מותר
//   const canChangeSlug = !!(isDraft && !initial?.slugChanged);
//   const slugFieldProps = {
//     ...register("slug"),
//     readOnly: !canChangeSlug,
//     className: `mt-1 block w-full rounded-md border-gray-300 shadow-sm ${!canChangeSlug ? "bg-slate-50 cursor-not-allowed" : ""}`,
//   };

//   return (
//     <form onSubmit={handleSubmit((data) => onSubmit?.(data), onError)} className="space-y-6" noValidate>
//       <div className={`p-2 rounded transition ${errors.name || errors.contactEmail ? "bg-red-50 text-red-700" : "invisible"}`}>
//         יש להשלים שם חנות ואימייל תקין.
//       </div>
// {     console.log("initial11", initial) }

//       <SettingsTabs labels={["כללי", "שירות לקוחות", "מיתוג ותיאור", "סלוג", "הגדרת נראות"]} initialActive={0}>
//         {/* כללי */}
//         <div className="grid md:grid-cols-2 gap-6">
//           <Section title="פרטים כלליים">
//             <div className="grid gap-4">
//               <div>
//                 <div className="text-sm mb-1">שם החנות</div>
//                 <input className="border rounded p-2 w-full" autoComplete="organization" {...register("name")} />
//                 {errors.name?.message && <div className="text-xs text-red-600 mt-1">{errors.name.message}</div>}
//               </div>

//               <div>
//                 <div className="text-sm mb-1">אימייל החנות</div>
//                 <input type="email" autoComplete="email" className="border rounded p-2 w-full" {...register("contactEmail")} />
//                 {errors.contactEmail?.message && (
//                   <div className="text-xs text-red-600 mt-1">{errors.contactEmail.message}</div>
//                 )}
//               </div>

//               <div>
//                 <div className="text-sm mb-1">טלפון</div>
//                 <input autoComplete="tel" className="border rounded p-2 w-full" {...register("phone")} />
//               </div>
//             </div>
//           </Section>
//         </div>

//         {/* שירות לקוחות */}
//         <div className="grid md:grid-cols-2 gap-6">
//           <Section title="שירות לקוחות">
//             <div className="grid gap-4">
//               <div>
//                 <div className="text-sm mb-1">אימייל תמיכה</div>
//                 <input type="email" autoComplete="email" className="border rounded p-2 w-full" {...register("support.email")} />
//               </div>
//               <div>
//                 <div className="text-sm mb-1">טלפון תמיכה</div>
//                 <input autoComplete="tel" className="border rounded p-2 w-full" {...register("support.phone")} />
//               </div>
//               <div>
//                 <div className="text-sm mb-1">WhatsApp</div>
//                 <input autoComplete="off" className="border rounded p-2 w-full" {...register("support.whatsapp")} />
//               </div>
//               <div>
//                 <div className="text-sm mb-1">שעות פעילות</div>
//                 <input placeholder="א-ה 09:00-17:00" autoComplete="off" className="border rounded p-2 w-full" {...register("support.hours")} />
//               </div>
//               <div>
//                 <div className="text-sm mb-1">הערה</div>
//                 <input autoComplete="off" className="border rounded p-2 w-full" {...register("support.note")} />
//               </div>
//             </div>
//           </Section>
//         </div>

//         {/* מיתוג ותיאור */}
//         <div className="space-y-4">
//           <Section title="לוגו ובאנרים">
//             <div className="grid md:grid-cols-2 gap-6">
//               <Controller
//                 control={control}
//                 name="logo"
//                 render={({ field }) => (
//                   <UploadMedia label="לוגו החנות" value={field.value} onChange={field.onChange} kinds={["image"]} accept="auto" hideKindSelector />
//                 )}
//               />
//               <div className="space-y-2">
//                 <div className="text-sm mb-1">סוג באנר חנות</div>
//                 <select
//                   className="border rounded p-2 w-full"
//                   {...bannerTypeStoreReg}
//                   onChange={(e) => {
//                     bannerTypeStoreReg.onChange(e);
//                     setBannerTypeStore(e.target.value);
//                   }}
//                 >
//                   <option value="static">תמונה סטטית</option>
//                   <option value="video">וידאו</option>
//                   <option value="slider">סליידר</option>
//                 </select>
//               </div>
//             </div>

//             {bannerTypeStore === "slider" ? (
//               <Controller
//                 control={control}
//                 name="storeSlider"
//                 render={({ field }) => <UploadGallery label="גלריית סליידר" value={field.value} onChange={field.onChange} />}
//               />
//             ) : (
//               <div className="grid md:grid-cols-2 gap-6 mt-4">
//                 <Controller
//                   control={control}
//                   name="storeBanner"
//                   render={({ field }) => (
//                     <UploadMedia
//                       label="באנר חנות"
//                       value={field.value}
//                       onChange={field.onChange}
//                       kinds={storeBannerKinds}
//                       accept="auto"
//                       hideKindSelector={storeBannerKinds.length === 1}
//                     />
//                   )}
//                 />
//                 <Controller
//                   control={control}
//                   name="mobileBanner"
//                   render={({ field }) => (
//                     <UploadMedia
//                       label="באנר נייד"
//                       value={field.value}
//                       onChange={field.onChange}
//                       kinds={mobileBannerKinds}
//                       accept="auto"
//                       hideKindSelector={mobileBannerKinds.length === 1}
//                     />
//                   )}
//                 />
//               </div>
//             )}

//             <div className="grid md:grid-cols-2 gap-6 mt-4">
//               <div className="text-sm mb-1">סוג באנר רשימת חנויות</div>
//               <select
//                 className="border rounded p-2 w-full"
//                 {...bannerTypeListReg}
//                 onChange={(e) => {
//                   bannerTypeListReg.onChange(e);
//                   setBannerTypeList(e.target.value);
//                 }}
//               >
//                 <option value="static">תמונה סטטית</option>
//                 <option value="video">וידאו</option>
//               </select>
//               <Controller
//                 control={control}
//                 name="listBanner"
//                 render={({ field }) => (
//                   <UploadMedia
//                     label="באנר רשימת חנות"
//                     value={field.value}
//                     onChange={field.onChange}
//                     kinds={listBannerKinds}
//                     accept="auto"
//                     hideKindSelector={listBannerKinds.length === 1}
//                   />
//                 )}
//               />
//             </div>
//           </Section>

//           <Section title="תיאור החנות">
//             <Controller
//               control={control}
//               name="description"
//               render={({ field }) => (
//                 <RichTextEditor
//                   value={field.value}
//                   onChange={field.onChange}
//                   onAddMedia={() => {
//                     const url = window.prompt("הדבק URL של תמונה/וידאו:");
//                     if (!url) return;
//                     field.onChange(`${field.value || ""}\n<p><img src="${url}" alt="media" /></p>`);
//                   }}
//                 />
//               )}
//             />
//           </Section>
//         </div>

//         {/* סלוג */}
//         <Section title="סלוג">
//           <div className="grid gap-3">
//             <div>
//               <div className="text-sm mb-1">הסלוג הנוכחי</div>
//               <input {...slugFieldProps} placeholder="למשל: my-store-name" />
//               {!canChangeSlug ? (
//                 <div className="text-xs text-slate-500 mt-1">לא ניתן לשנות (כבר שונה פעם אחת או שהחנות אינה בטיוטה).</div>
//               ) : (
//                 <div className="text-xs text-slate-500 mt-1">ניתן לשנות פעם אחת בזמן טיוטה.</div>
//               )}
//             </div>

//             {canChangeSlug && (
//               <div className="flex flex-wrap gap-2">
//                 <button
//                   type="button"
//                   className="px-3 py-2 rounded bg-slate-800 text-white hover:bg-slate-700"
//                   onClick={onAutoSlug}
//                 >
//                   עדכון סלוג אוטומטי מהשם
//                 </button>
//                 <button
//                   type="button"
//                   className="px-3 py-2 rounded bg-indigo-700 text-white hover:bg-indigo-600"
//                   onClick={() => onCustomSlug(getValues("slug"))}
//                 >
//                   שמירת סלוג מותאם
//                 </button>
//               </div>
//             )}
//           </div>
//         </Section>

//         {/* נראות */}
//         <Section title="הגדרת נראות חנות">
//           <div className="grid md:grid-cols-2 gap-6">
//             <div>
//               <div className="text-sm mb-1">Store Name Position</div>
//               <select className="border rounded p-2 w-full" {...register("appearance.storeNamePosition")}>
//                 <option value="header">At Header</option>
//                 <option value="over-banner">Over Banner</option>
//                 <option value="hidden">Hidden</option>
//               </select>
//             </div>

//             <div>
//               <div className="text-sm mb-1">Products per page</div>
//               <input type="number" className="border rounded p-2 w-full" {...register("appearance.productsPerPage", { valueAsNumber: true })} />
//             </div>

//             <label className="flex items-center gap-2">
//               <input type="checkbox" className="h-5 w-5" {...register("appearance.hideEmail")} />
//               <span>הסתר אימייל מהחנות</span>
//             </label>
//             <label className="flex items-center gap-2">
//               <input type="checkbox" className="h-5 w-5" {...register("appearance.hidePhone")} />
//               <span>הסתר את הטלפון מהחנות</span>
//             </label>
//             <label className="flex items-center gap-2">
//               <input type="checkbox" className="h-5 w-5" {...register("appearance.hideAddress")} />
//               <span>הסתר כתובת מהחנות</span>
//             </label>
//             <label className="flex items-center gap-2">
//               <input type="checkbox" className="h-5 w-5" {...register("appearance.hideAbout")} />
//               <span>הסתר את אודות מהחנות</span>
//             </label>
//           </div>
//         </Section>
//       </SettingsTabs>

//       {/* כפתורי תחתית כלליים */}
//       <div className="flex flex-col sm:flex-row gap-3 justify-end">
//         <button
//           type="submit"
//           disabled={submitting}
//           className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 disabled:opacity-60"
//         >
//           {submitting ? "שומר…" : "שמירת פרטים"}
//         </button>
//         <button
//           type="button"
//           onClick={handleUploadMedia}
//           className="bg-teal-700 text-white px-4 py-2 rounded hover:bg-teal-600"
//         >
//           העלאת מדיה
//         </button>
//       </div>
//     </form>
//   );
// }









import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import SettingsTabs from "./SettingsTabs.jsx";
import UploadMedia from "./UploadMedia.jsx";
import UploadGallery from "./UploadGallery.jsx";
import RichTextEditor from "./RichTextEditor.jsx";
import { uploadStoreMedia } from "./storeApi.js";

// סכימות
const mediaUrlSchema = z.string().trim().optional().transform((s) => s ?? "").refine(
  (s) =>
    s === "" ||
    /^https?:\/\//i.test(s) ||
    s.startsWith("/") ||
    s.startsWith("blob:") ||
    s.startsWith("data:"),
  "URL לא תקין"
);
const mediaSoftSchema = z.object({ kind: z.enum(["image", "video"]).optional(), url: mediaUrlSchema, alt: z.string().optional() });
const schema = z.object({
  name: z.string().min(2, "שם חנות קצר מדי").trim(),
  contactEmail: z.string().email("אימייל לא תקין").transform((s) => s.toLowerCase().trim()),
  phone: z.string().trim().optional(),
  support: z.object({
    email: z.string().email("אימייל לא תקין").transform((s) => s.toLowerCase().trim()).optional().or(z.literal("")),
    phone: z.string().trim().optional(),
    whatsapp: z.string().trim().optional(),
    hours: z.string().trim().optional(),
    note: z.string().trim().optional(),
  }).optional().default({}),
  logo: mediaSoftSchema.optional(),
  bannerTypeStore: z.enum(["static", "video", "slider"]).optional().default("static"),
  storeBanner: mediaSoftSchema.optional(),
  mobileBanner: mediaSoftSchema.optional(),
  storeSlider: z.array(mediaSoftSchema).optional().default([]),
  bannerTypeList: z.enum(["static", "video"]).optional().default("static"),
  listBanner: mediaSoftSchema.optional(),
  description: z.string().optional(),
  appearance: z.object({
    storeNamePosition: z.enum(["header", "over-banner", "hidden"]).optional().default("header"),
    productsPerPage: z.coerce.number().int().min(1).max(1000).optional().default(24),
    hideEmail: z.boolean().optional().default(false),
    hidePhone: z.boolean().optional().default(false),
    hideAddress: z.boolean().optional().default(false),
    hideAbout: z.boolean().optional().default(false),
  }).optional().default({}),
  policies: z.object({ about: z.string().optional(), shipping: z.string().optional(), returns: z.string().optional(), privacy: z.string().optional(), terms: z.string().optional(), }).optional().default({}),
  // מידע תצוגה ללשונית סלוג
  slug: z.string().optional(),
  status: z.string().optional(),
  slugChanged: z.boolean().optional(),
});

export default function StoreSettingsForm({
  initial,
  onSubmit,
  submitting,
  isDraft,
  onCustomSlug,
}) {
  const didInitRef = useRef(false);

  const { register, handleSubmit, control, reset, formState: { errors }, getValues } = useForm({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    shouldFocusError: true,
    defaultValues: initial || {
      name: "",
      contactEmail: "",
      phone: "",
      support: { email: "", phone: "", whatsapp: "", hours: "", note: "" },
      logo: { kind: "image", url: "", alt: "" },
      bannerTypeStore: "static",
      storeBanner: { kind: "image", url: "", alt: "" },
      mobileBanner: { kind: "image", url: "", alt: "" },
      storeSlider: [],
      bannerTypeList: "static",
      listBanner: { kind: "image", url: "", alt: "" },
      description: "",
      appearance: { storeNamePosition: "header", productsPerPage: 24, hideEmail: false, hidePhone: false, hideAddress: false, hideAbout: false },
      policies: { about: "", shipping: "", returns: "", privacy: "", terms: "" },
      slug: initial?.slug || "",
      status: initial?.status || "draft",
      slugChanged: !!initial?.slugChanged,
    },
  });

  const [bannerTypeStore, setBannerTypeStore] = useState(initial?.bannerTypeStore || "static");
  const [bannerTypeList, setBannerTypeList] = useState(initial?.bannerTypeList || "static");

  useEffect(() => {
    if (!initial) return;
    if (didInitRef.current) return;
    reset(initial);
    setBannerTypeStore(initial.bannerTypeStore || "static");
    setBannerTypeList(initial.bannerTypeList || "static");
    didInitRef.current = true;
  }, [initial, reset]);

  const storeBannerKinds = bannerTypeStore === "video" ? ["video"] : ["image"];
  const mobileBannerKinds = bannerTypeStore === "video" ? ["video"] : ["image"];
  const listBannerKinds = bannerTypeList === "video" ? ["video"] : ["image"];

  const Section = ({ title, children }) => (
    <section className="bg-white p-4 rounded-xl shadow space-y-3">
      <h3 className="font-bold text-lg">{title}</h3>
      {children}
    </section>
  );

  const onError = (errs) => {
    if (errs.name || errs.contactEmail) alert("אנא מלאי שם חנות ואימייל תקין");
  };

  const handleUploadMedia = async () => {
    const v = getValues();
    const files = {
      logo: v?.logo?._file,
      storeBanner: v?.storeBanner?._file,
      mobileBanner: v?.mobileBanner?._file,
      listBanner: v?.listBanner?._file,
      slider: Array.isArray(v?.storeSlider) ? v.storeSlider.map((m) => m?._file).filter(Boolean) : [],
    };
    const anyFile = !!files.logo || !!files.storeBanner || !!files.mobileBanner || !!files.listBanner || (files.slider && files.slider.length > 0);
    if (!anyFile) return alert("לא נבחרו קבצים להעלאה.");

    try {
      const res = await uploadStoreMedia({
        bannerTypeStore: v?.bannerTypeStore || "static",
        bannerTypeList: v?.bannerTypeList || "static",
        replaceSlider: false,
        files,
      });
      if (res?.store) {
        reset(res.store);
        setBannerTypeStore(res.store.bannerTypeStore || "static");
        setBannerTypeList(res.store.bannerTypeList || "static");
      }
      alert("המדיה הועלתה ונשמרה");
    } catch (e) {
      console.error(e);
      alert("העלאת מדיה נכשלה");
    }
  };

  const bannerTypeStoreReg = register("bannerTypeStore");
  const bannerTypeListReg = register("bannerTypeList");

  const canChangeSlug = !!(isDraft && !initial?.slugChanged);
  const slugFieldProps = {
    ...register("slug"),
    readOnly: !canChangeSlug,
    className: `mt-1 block w-full rounded-md border-gray-300 shadow-sm ${!canChangeSlug ? "bg-slate-50 cursor-not-allowed" : ""}`,
    placeholder: "למשל: my-store-name",
  };

  return (
    <form onSubmit={handleSubmit((data) => onSubmit?.(data), onError)} className="space-y-6" noValidate>
      <div className={`p-2 rounded transition ${errors.name || errors.contactEmail ? "bg-red-50 text-red-700" : "invisible"}`}>
        יש להשלים שם חנות ואימייל תקין.
      </div>

      <SettingsTabs labels={["כללי", "שירות לקוחות", "מיתוג ותיאור", "הגדרת נראות", "סלוג"]} initialActive={0}>
        {/* כללי */}
        <div className="grid md:grid-cols-2 gap-6">
          <Section title="פרטים כלליים">
            <div className="grid gap-4">
              <div>
                <div className="text-sm mb-1">שם החנות</div>
                <input className="border rounded p-2 w-full" autoComplete="organization" {...register("name")} />
                {errors.name?.message && <div className="text-xs text-red-600 mt-1">{errors.name.message}</div>}
              </div>

              <div>
                <div className="text-sm mb-1">אימייל החנות</div>
                <input type="email" autoComplete="email" className="border rounded p-2 w-full" {...register("contactEmail")} />
                {errors.contactEmail?.message && <div className="text-xs text-red-600 mt-1">{errors.contactEmail.message}</div>}
              </div>

              <div>
                <div className="text-sm mb-1">טלפון</div>
                <input autoComplete="tel" className="border rounded p-2 w-full" {...register("phone")} />
              </div>
            </div>
          </Section>
        </div>

        {/* שירות לקוחות */}
        <div className="grid md:grid-cols-2 gap-6">
          <Section title="שירות לקוחות">
            <div className="grid gap-4">
              <div>
                <div className="text-sm mb-1">אימייל תמיכה</div>
                <input type="email" autoComplete="email" className="border rounded p-2 w-full" {...register("support.email")} />
              </div>
              <div>
                <div className="text-sm mb-1">טלפון תמיכה</div>
                <input autoComplete="tel" className="border rounded p-2 w-full" {...register("support.phone")} />
              </div>
              <div>
                <div className="text-sm mb-1">WhatsApp</div>
                <input autoComplete="off" className="border rounded p-2 w-full" {...register("support.whatsapp")} />
              </div>
              <div>
                <div className="text-sm mb-1">שעות פעילות</div>
                <input placeholder="א-ה 09:00-17:00" autoComplete="off" className="border rounded p-2 w-full" {...register("support.hours")} />
              </div>
              <div>
                <div className="text-sm mb-1">הערה</div>
                <input autoComplete="off" className="border rounded p-2 w-full" {...register("support.note")} />
              </div>
            </div>
          </Section>
        </div>

        {/* מיתוג ותיאור */}
        <div className="space-y-4">
          <Section title="לוגו ובאנרים">
            <div className="grid md:grid-cols-2 gap-6">
              <Controller
                control={control}
                name="logo"
                render={({ field }) => (
                  <UploadMedia label="לוגו החנות" value={field.value} onChange={field.onChange} kinds={["image"]} accept="auto" hideKindSelector />
                )}
              />
              <div className="space-y-2">
                <div className="text-sm mb-1">סוג באנר חנות</div>
                <select
                  className="border rounded p-2 w-full"
                  {...bannerTypeStoreReg}
                  onChange={(e) => { bannerTypeStoreReg.onChange(e); setBannerTypeStore(e.target.value); }}
                >
                  <option value="static">תמונה סטטית</option>
                  <option value="video">וידאו</option>
                  <option value="slider">סליידר</option>
                </select>
              </div>
            </div>

            {bannerTypeStore === "slider" ? (
              <Controller control={control} name="storeSlider" render={({ field }) => <UploadGallery label="גלריית סליידר" value={field.value} onChange={field.onChange} />} />
            ) : (
              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <Controller
                  control={control}
                  name="storeBanner"
                  render={({ field }) => (
                    <UploadMedia label="באנר חנות" value={field.value} onChange={field.onChange} kinds={storeBannerKinds} accept="auto" hideKindSelector={storeBannerKinds.length === 1} />
                  )}
                />
                <Controller
                  control={control}
                  name="mobileBanner"
                  render={({ field }) => (
                    <UploadMedia label="באנר נייד" value={field.value} onChange={field.onChange} kinds={mobileBannerKinds} accept="auto" hideKindSelector={mobileBannerKinds.length === 1} />
                  )}
                />
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div className="text-sm mb-1">סוג באנר רשימת חנויות</div>
              <select
                className="border rounded p-2 w-full"
                {...bannerTypeListReg}
                onChange={(e) => { bannerTypeListReg.onChange(e); setBannerTypeList(e.target.value); }}
              >
                <option value="static">תמונה סטטית</option>
                <option value="video">וידאו</option>
              </select>
              <Controller
                control={control}
                name="listBanner"
                render={({ field }) => (
                  <UploadMedia label="באנר רשימת חנות" value={field.value} onChange={field.onChange} kinds={listBannerKinds} accept="auto" hideKindSelector={listBannerKinds.length === 1} />
                )}
              />
            </div>
          </Section>

          <Section title="תיאור החנות">
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  onAddMedia={() => {
                    const url = window.prompt("הדבק URL של תמונה/וידאו:");
                    if (!url) return;
                    field.onChange(`${field.value || ""}\n<p><img src="${url}" alt="media" /></p>`);
                  }}
                />
              )}
            />
          </Section>
        </div>



        {/* נראות */}
        <Section title="הגדרת נראות חנות">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm mb-1">Store Name Position</div>
              <select className="border rounded p-2 w-full" {...register("appearance.storeNamePosition")}>
                <option value="header">At Header</option>
                <option value="over-banner">Over Banner</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>

            <div>
              <div className="text-sm mb-1">Products per page</div>
              <input type="number" className="border rounded p-2 w-full" {...register("appearance.productsPerPage", { valueAsNumber: true })} />
            </div>

            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-5 w-5" {...register("appearance.hideEmail")} />
              <span>הסתר אימייל מהחנות</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-5 w-5" {...register("appearance.hidePhone")} />
              <span>הסתר את הטלפון מהחנות</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-5 w-5" {...register("appearance.hideAddress")} />
              <span>הסתר כתובת מהחנות</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-5 w-5" {...register("appearance.hideAbout")} />
              <span>הסתר את אודות מהחנות</span>
            </label>
          </div>
        </Section>
        {/* סלוג */}
        <Section title="סלוג">
          <div className="grid gap-3">
            <div>
              <div className="text-sm mb-1">הסלוג הנוכחי</div>
              <input {...slugFieldProps} />
              {!canChangeSlug
                ? <div className="text-xs text-slate-500 mt-1">לא ניתן לשנות (כבר שונה פעם אחת או שהחנות אינה בטיוטה).</div>
                : <div className="text-xs text-slate-500 mt-1">ניתן לשנות פעם אחת בזמן טיוטה.</div>}
            </div>

            {canChangeSlug && (
              <div className="flex flex-wrap gap-2">
                <button type="button" className="px-3 py-2 rounded bg-indigo-700 text-white hover:bg-indigo-600" onClick={() => onCustomSlug(getValues("slug"))}>
                  שמירת סלוג מותאם
                </button>
              </div>
            )}
          </div>
        </Section>
      </SettingsTabs>


      {/* כפתורי תחתית כלליים */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <button type="submit" disabled={submitting} className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 disabled:opacity-60">
          {submitting ? "שומר…" : "שמירת פרטים"}
        </button>
        <button type="button" onClick={handleUploadMedia} className="bg-teal-700 text-white px-4 py-2 rounded hover:bg-teal-600">
          העלאת מדיה
        </button>
      </div>
    </form>
  );
}
