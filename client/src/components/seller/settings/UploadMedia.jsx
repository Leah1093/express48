// // src/components/UploadMedia.jsx
// import { useMemo, useRef, useState } from "react";
// import { mediaUrl } from "./mediaUrl";

// export default function UploadMedia({
//   label = "מדיה",
//   value,
//   onChange,
//   onUpload,                   // אופציונלי
//   kinds = ["image", "video"], // אילו סוגים מותרים
//   accept = "auto",            // "auto" => נגזרת מה-kind הנוכחי; אפשר גם מחרוזת מותאמת אישית
//   allowClear = true,
//   hideKindSelector = false,
// }) {
//   const [dragOver, setDragOver] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const fileInputRef = useRef(null);

//   const current = value || { kind: kinds[0] || "image", url: "", alt: "" };
//   const hasUrl = !!current.url;
//   const isImage = current.kind === "image";
//   const isVideo = current.kind === "video";

//   // accept דינמי
//   const resolvedAccept = useMemo(() => {
//     if (accept !== "auto") return accept;
//     if (kinds.length === 1 && kinds[0] === "video") return "video/mp4,video/webm";
//     if (kinds.length === 1 && kinds[0] === "image") return "image/*";
//     return current.kind === "video" ? "video/mp4,video/webm" : "image/*";
//   }, [accept, kinds, current.kind]);

//   // כאן התיקון: תצוגה תמיד על בסיס כתובת מוחלטת לשרת
//   const preview = useMemo(() => mediaUrl(current.url), [current.url]);

//   const updateField = (patch) => onChange?.({ ...current, ...patch });

//   const handleKindChange = (e) => {
//     const nextKind = e.target.value;
//     updateField({ kind: nextKind });
//   };

//   const handleAltChange = (e) => updateField({ alt: e.target.value });

//   const chooseFile = () => fileInputRef.current?.click();

//   // קביעה אוטומטית של kind לפי הקובץ
//   const detectKindFromFile = (file) => {
//     if (!file?.type) return current.kind;
//     if (file.type.startsWith("video/")) return "video";
//     if (file.type.startsWith("image/")) return "image";
//     return current.kind;
//   };

//   // קביעה אוטומטית של kind לפי URL
//   const detectKindFromUrl = (url) => {
//     const u = String(url).toLowerCase();
//     if (/\.(mp4|webm|ogg|ogv|m4v)(\?|#|$)/i.test(u)) return "video";
//     if (/\.(png|jpe?g|gif|webp|avif|svg)(\?|#|$)/i.test(u)) return "image";
//     return current.kind;
//   };

//   // שמירת File מקומית + blob preview (ההעלאה לשרת מתבצעת בכפתור "העלאת מדיה")
//   const doUpload = async (file) => {
//     if (!file) return;
//     const inferredKind = detectKindFromFile(file);

//     if (!onUpload) {
//       const objectUrl = URL.createObjectURL(file);
//       setUploading(true);
//       setProgress(100);
//       updateField({ kind: inferredKind, url: objectUrl, _file: file });
//       setTimeout(() => {
//         setUploading(false);
//         setProgress(0);
//       }, 300);
//       return;
//     }

//     // (אם מגדירים onUpload חיצוני – נתמך גם)
//     try {
//       setUploading(true);
//       setProgress(5);
//       const url = await onUpload(file, (p) => {
//         if (typeof p === "number") setProgress(Math.max(10, Math.min(98, p)));
//       });
//       setProgress(100);
//       updateField({ kind: inferredKind, url, _file: file });
//     } catch (err) {
//       console.error("Upload failed:", err);
//       alert("העלאה נכשלה");
//     } finally {
//       setTimeout(() => {
//         setUploading(false);
//         setProgress(0);
//       }, 400);
//     }
//   };

//   const onFileChange = async (e) => {
//     const file = e.target.files?.[0];
//     await doUpload(file);
//     e.target.value = "";
//   };

//   const pasteUrl = () => {
//     const url = window.prompt("הדביקי URL של תמונה או וידאו:");
//     if (!url) return;
//     const inferredKind = detectKindFromUrl(url);
//     const nextKind = kinds.includes(inferredKind) ? inferredKind : current.kind;
//     updateField({ kind: nextKind, url, _file: undefined });
//   };

//   const clear = () => allowClear && updateField({ url: "", alt: "", _file: undefined });

//   return (
//     <div className="space-y-2">
//       {label ? <div className="text-sm font-medium">{label}</div> : null}

//       <div className="flex flex-wrap items-center gap-2">
//         {!hideKindSelector && kinds.length > 1 && (
//           <select className="border rounded p-2 text-sm" value={current.kind} onChange={handleKindChange}>
//             {kinds.includes("image") && <option value="image">תמונה</option>}
//             {kinds.includes("video") && <option value="video">וידאו</option>}
//           </select>
//         )}

//         <button type="button" onClick={pasteUrl} className="px-3 py-2 border rounded text-sm hover:bg-slate-50">
//           הדבקת URL
//         </button>

//         <button
//           type="button"
//           onClick={chooseFile}
//           className="px-3 py-2 border rounded text-sm hover:bg-slate-50 disabled:opacity-60"
//           disabled={uploading}
//         >
//           {uploading ? "מעלה…" : "בחירת קובץ"}
//         </button>

//         {allowClear && hasUrl && (
//           <button
//             type="button"
//             onClick={clear}
//             className="px-3 py-2 border rounded text-sm hover:bg-slate-50 text-red-600"
//           >
//             ניקוי
//           </button>
//         )}
//       </div>

//       <div
//         className={`relative border-2 border-dashed rounded-xl p-4 text-center transition ${
//           dragOver ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-white"
//         }`}
//         onDragOver={(e) => {
//           e.preventDefault();
//           setDragOver(true);
//         }}
//         onDragLeave={() => setDragOver(false)}
//         onDrop={(e) => {
//           e.preventDefault();
//           setDragOver(false);
//           const file = e.dataTransfer.files?.[0];
//           doUpload(file);
//         }}
//       >
//         {!hasUrl && (
//           <div className="text-slate-500 text-sm">
//             גררי לכאן קובץ או לחצי על "בחירת קובץ". ניתן גם להדביק URL.
//           </div>
//         )}

//         {hasUrl && isImage && (
//           <img
//             src={preview}
//             alt={current.alt || "preview"}
//             className="mx-auto max-h-64 rounded-lg object-contain"
//             draggable={false}
//           />
//         )}

//         {hasUrl && isVideo && (
//           <video
//             key={preview}
//             src={preview}
//             className="mx-auto max-h-64 rounded-lg"
//             controls
//             playsInline
//             preload="metadata"
//           />
//         )}

//         {uploading && (
//           <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-xl">
//             <div className="w-2/3">
//               <div className="mb-2 text-sm">מעלה… {progress}%</div>
//               <div className="h-2 bg-slate-200 rounded">
//                 <div className="h-2 bg-blue-600 rounded" style={{ width: `${progress}%` }} />
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {isImage && (
//         <div className="mt-2">
//           <input
//             className="border rounded p-2 w-full text-sm"
//             placeholder="Alt (טקסט חלופי)"
//             value={current.alt || ""}
//             onChange={handleAltChange}
//           />
//         </div>
//       )}

//       <input ref={fileInputRef} type="file" accept={resolvedAccept} className="hidden" onChange={onFileChange} />
//     </div>
//   );
// }





import { useMemo, useRef, useState } from "react";
import { mediaUrl } from "./mediaUrl";

export default function UploadMedia({  label = "מדיה",  value,  onChange,  onUpload,                   // אופציונלי
  kinds = ["image", "video"],  accept = "auto",  allowClear = true,  hideKindSelector = false,}) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const current = value || { kind: kinds[0] || "image", url: "", alt: "" };
  const hasUrl = !!current.url;
  const isImage = current.kind === "image";
  const isVideo = current.kind === "video";

  const resolvedAccept = useMemo(() => {
    if (accept !== "auto") return accept;
    if (kinds.length === 1 && kinds[0] === "video") return "video/mp4,video/webm";
    if (kinds.length === 1 && kinds[0] === "image") return "image/*";
    return current.kind === "video" ? "video/mp4,video/webm" : "image/*";
  }, [accept, kinds, current.kind]);

  const preview = useMemo(() => mediaUrl(current.url), [current.url]);
  const updateField = (patch) => onChange?.({ ...current, ...patch });

  const detectKindFromFile = (file) => {
    if (!file?.type) return current.kind;
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("image/")) return "image";
    return current.kind;
  };
  const detectKindFromUrl = (url) => {
    const u = String(url).toLowerCase();
    if (/\.(mp4|webm|ogg|ogv|m4v)(\?|#|$)/i.test(u)) return "video";
    if (/\.(png|jpe?g|gif|webp|avif|svg)(\?|#|$)/i.test(u)) return "image";
    return current.kind;
  };

  const chooseFile = () => fileInputRef.current?.click();
  const handleKindChange = (e) => updateField({ kind: e.target.value });
  const handleAltChange = (e) => updateField({ alt: e.target.value });

  const doUpload = async (file) => {
    if (!file) return;
    const inferredKind = detectKindFromFile(file);

    if (!onUpload) {
      const objectUrl = URL.createObjectURL(file);
      setUploading(true);
      setProgress(100);
      updateField({ kind: inferredKind, url: objectUrl, _file: file });
      setTimeout(() => { setUploading(false); setProgress(0); }, 300);
      return;
    }

    try {
      setUploading(true);
      setProgress(5);
      const url = await onUpload(file, (p) => {
        if (typeof p === "number") setProgress(Math.max(10, Math.min(98, p)));
      });
      setProgress(100);
      updateField({ kind: inferredKind, url, _file: file });
    } catch (err) {
      console.error("Upload failed:", err);
      alert("העלאה נכשלה");
    } finally {
      setTimeout(() => { setUploading(false); setProgress(0); }, 400);
    }
  };

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    await doUpload(file);
    e.target.value = "";
  };

  const pasteUrl = () => {
    const url = window.prompt("הדביקי URL של תמונה או וידאו:");
    if (!url) return;
    const inferredKind = detectKindFromUrl(url);
    const nextKind = kinds.includes(inferredKind) ? inferredKind : current.kind;
    updateField({ kind: nextKind, url, _file: undefined });
  };

  const clear = () => allowClear && updateField({ url: "", alt: "", _file: undefined });

  return (
    <div className="space-y-2">
      {label ? <div className="text-sm font-medium">{label}</div> : null}

      <div className="flex flex-wrap items-center gap-2">
        {!hideKindSelector && kinds.length > 1 && (
          <select className="border rounded p-2 text-sm" value={current.kind} onChange={handleKindChange}>
            {kinds.includes("image") && <option value="image">תמונה</option>}
            {kinds.includes("video") && <option value="video">וידאו</option>}
          </select>
        )}

        <button type="button" onClick={pasteUrl} className="px-3 py-2 border rounded text-sm hover:bg-slate-50">
          הדבקת URL
        </button>

        <button type="button" onClick={chooseFile} className="px-3 py-2 border rounded text-sm hover:bg-slate-50 disabled:opacity-60" disabled={uploading}>
          {uploading ? "מעלה…" : "בחירת קובץ"}
        </button>

        {allowClear && hasUrl && (
          <button type="button" onClick={clear} className="px-3 py-2 border rounded text-sm hover:bg-slate-50 text-red-600">
            ניקוי
          </button>
        )}
      </div>

      <div
        className={`relative border-2 border-dashed rounded-xl p-4 text-center transition ${dragOver ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-white"}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files?.[0]; doUpload(file); }}
      >
        {!hasUrl && <div className="text-slate-500 text-sm">גררי לכאן קובץ / הדביקי URL / בחרי קובץ.</div>}

        {hasUrl && isImage && (
          <img src={preview} alt={current.alt || "preview"} className="mx-auto max-h-64 rounded-lg object-contain" draggable={false} />
        )}

        {hasUrl && isVideo && (
          <video key={preview} src={preview} className="mx-auto max-h-64 rounded-lg" controls playsInline preload="metadata" />
        )}

        {uploading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-xl">
            <div className="w-2/3">
              <div className="mb-2 text-sm">מעלה… {progress}%</div>
              <div className="h-2 bg-slate-200 rounded">
                <div className="h-2 bg-blue-600 rounded" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {isImage && (
        <div className="mt-2">
          <input className="border rounded p-2 w-full text-sm" placeholder="Alt (טקסט חלופי)" value={current.alt || ""} onChange={handleAltChange} />
        </div>
      )}

      <input ref={fileInputRef} type="file" accept={resolvedAccept} className="hidden" onChange={onFileChange} />
    </div>
  );
}
