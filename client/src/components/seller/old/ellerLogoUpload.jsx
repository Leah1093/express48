// components/seller/SellerLogoUpload.jsx
import { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function SellerLogoUpload({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [preview, setPreview] = useState("");
  const inputRef = useRef(null);

  const api = axios.create({
    baseURL: "http://localhost:8080/",
    withCredentials: true,
    timeout: 15000,
  });

  const onFile = (e) => {
    const f = e.target.files?.[0] || null;
    setMsg("");

    // ניקוי preview ישן
    if (preview) URL.revokeObjectURL(preview);

    if (f) {
      // ולידציה בסיסית: סוג וגודל (2MB לדוגמה)
      const okType = ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(f.type);
      const okSize = f.size <= 2 * 1024 * 1024;
      if (!okType) {
        setMsg("סוג קובץ לא נתמך");
        e.target.value = "";
        return;
      }
      if (!okSize) {
        setMsg("הקובץ גדול מדי (מקסימום 2MB)");
        e.target.value = "";
        return;
      }
      setFile(f);
      setPreview(URL.createObjectURL(f));
    } else {
      setFile(null);
      setPreview("");
    }
  };

  const clearSelection = () => {
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview("");
    }
  };

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      setBusy(true);
      setMsg("");

      const fd = new FormData();
      fd.append("logo", file);

      // ודאי שהנתיב תואם לשרת: אם אצלך זה /seller-profile/me/logo תשני כאן
      const { data } = await api.put("/seller-profile/me/logo", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onUploaded?.(data?.seller || data);
      setMsg("לוגו הועלה בהצלחה");
      clearSelection();
    } catch (err) {
      const code = err?.response?.status;
      const text =
        err?.response?.data?.message ||
        (code === 413 ? "קובץ גדול מדי" : code === 415 ? "סוג קובץ לא נתמך" : "שגיאה בהעלאה");
      setMsg(text);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    // ניקוי URL כשהקומפוננטה נסגרת
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <form onSubmit={upload} className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={onFile}
          className="block w-full text-sm"
          disabled={busy}
        />
        <button
          type="submit"
          className="rounded-2xl bg-gray-900 px-4 py-2 text-sm text-white hover:bg-black disabled:opacity-50"
          disabled={!file || busy}
        >
          {busy ? "מעלה..." : "העלה"}
        </button>
      </div>

      {preview && (
        <div className="flex items-center gap-3">
          <img
            src={preview}

            alt="תצוגה מקדימה"
            className="h-16 w-16 rounded-xl object-cover border"
          />
          <button
            type="button"
            onClick={clearSelection}
            className="rounded-xl bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
            disabled={busy}
          >
            ביטול
          </button>
        </div>
      )}

      {msg && <div className="text-sm text-gray-700">{msg}</div>}
    </form>
  );
}
