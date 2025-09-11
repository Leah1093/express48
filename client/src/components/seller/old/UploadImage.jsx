import { useEffect, useState } from "react";

export default function UploadImage({ label, value = { url: "", alt: "" }, onChange }) {
  const [url, setUrl] = useState(value?.url || "");
  const [alt, setAlt] = useState(value?.alt || "");

  useEffect(() => { setUrl(value?.url || ""); setAlt(value?.alt || ""); }, [value]);

  const emit = (u = url, a = alt) => onChange?.({ url: u, alt: a });

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{label}</div>
      <div className="grid md:grid-cols-2 gap-2">
        <input className="border rounded p-2" placeholder="https://…" value={url}
               onChange={(e)=>{ setUrl(e.target.value); emit(e.target.value, alt); }} />
        <input className="border rounded p-2" placeholder="טקסט חלופי (alt)" value={alt}
               onChange={(e)=>{ setAlt(e.target.value); emit(url, e.target.value); }} />
      </div>
      {url ? (
        <div className="border rounded p-2 w-full max-w-xs">
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img src={url} className="w-full h-32 object-contain" alt={alt || "preview"} />
        </div>
      ) : null}
      <div className="text-xs text-slate-500">בשלב ראשון מזינים URL. נחליף להעלאה לקבצים בהמשך.</div>
    </div>
  );
}
