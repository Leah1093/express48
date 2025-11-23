// ProductImportFromCsv.jsx
import { useState } from "react";
import { useImportSellerProductsCsvMutation } from "../../../../redux/services/sellerProductsApi";
import toast from "react-hot-toast";
import Papa from "papaparse";

export default function ProductImportFromCsv({ onClose, onImported }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null); // { headers: string[], rows: string[][] }
  const [showPreview, setShowPreview] = useState(false);

  const [importResult, setImportResult] = useState(null); // { importedCount, failedCount, failed: [...] }
  const [showResultModal, setShowResultModal] = useState(false);

  const [importCsv, { isLoading }] = useImportSellerProductsCsvMutation();

  // --- קריאת קובץ ויצירת תצוגה מקדימה ---
  // תמיכה גם בקבצי UTF-8 וגם בקבצי windows-1255 (עברית של ווינדוס)
  // וגם כיבוד מרכאות, פסיקים בתוך שדות ו-HTML
  const buildPreviewFromFile = (f) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const buffer = e.target.result; // ArrayBuffer
          let text;

          // קודם ננסה UTF-8
          try {
            text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
          } catch {
            // אם נכשל – ננסה windows-1255 (קלאסי באקסל/ווינדוס בעברית)
            text = new TextDecoder("windows-1255").decode(buffer);
          }

          // זיהוי delimiter כמו בשרת
          const firstLine =
            text.split(/\r?\n/).find((l) => l.trim().length > 0) || "";
          const candidates = [",", ";", "\t"];
          let delimiter = ",";
          let maxParts = 0;

          for (const d of candidates) {
            const parts = firstLine.split(d).length;
            if (parts > maxParts) {
              maxParts = parts;
              delimiter = d;
            }
          }

          // כאן הפארס האמיתי – PapaParse
          const parsed = Papa.parse(text, {
            header: true, // שורה ראשונה = שמות עמודות
            skipEmptyLines: true,
            delimiter, // אותו דלימיטר כמו בשרת
          });

          if (!parsed.data || parsed.data.length === 0) {
            return resolve(null);
          }

          const headers =
            parsed.meta.fields && parsed.meta.fields.length
              ? parsed.meta.fields
              : Object.keys(parsed.data[0]);

          const rows = parsed.data.map((row) =>
            headers.map((h) =>
              row[h] === undefined || row[h] === null ? "" : String(row[h])
            )
          );

          resolve({ headers, rows });
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = (e) => reject(e);

      // חשוב – ArrayBuffer, לא readAsText
      reader.readAsArrayBuffer(f);
    });
  };

  const handleFileChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.name.toLowerCase().endsWith(".csv")) {
      toast.error("יש להעלות קובץ CSV בלבד");
      return;
    }

    setFile(f);

    try {
      const p = await buildPreviewFromFile(f);
      if (!p) {
        toast.error("הקובץ ריק או לא קריא");
        setPreview(null);
        setShowPreview(false);
        return;
      }
      setPreview(p);
      setShowPreview(true);
    } catch (err) {
      console.error("CSV preview error:", err);
      toast.error("שגיאה בקריאת הקובץ לתצוגה מקדימה");
      setPreview(null);
      setShowPreview(false);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("לא נבחר קובץ");
      return;
    }

    try {
      const res = await importCsv(file).unwrap();

      // לשמור תוצאות בשביל פופ־אפ
      setImportResult(res);
      if (res?.failedCount > 0 || (res?.failed && res.failed.length > 0)) {
        setShowResultModal(true);
      }

      toast.success(
        `יובאו ${res.importedCount || 0} מוצרים, ${res.failedCount || 0} נכשלו`
      );

      if (typeof onImported === "function") {
        onImported(res);
      }

      // לא חייבים לסגור את הקומפוננטה אם היו כשלונות – נשאיר לך שליטה
      // אם את כן רוצה לסגור בכל מקרה:
      // if (onClose) onClose();
    } catch (err) {
      console.error("CSV import error:", err);
      const msg = err?.data?.error || err?.message || "שגיאה בייבוא הקובץ";
      toast.error(msg);
    }
  };

  return (
    <div
      className="border border-slate-300 rounded-xl p-4 bg-slate-50"
      dir="rtl"
    >
      {/* כותרת עליונה */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-right font-semibold text-sm">
          ייבוא מוצרים מקובץ CSV
        </h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            ✕ סגור
          </button>
        )}
      </div>

      {/* גוף הטופס */}
      <div className="flex flex-col gap-3 items-end">
        <div className="flex flex-col gap-2 w-full items-end">
          <label className="text-xs text-slate-700">בחרי קובץ CSV מהמחשב</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="text-right text-xs file:mr-2 file:px-3 file:py-1 file:rounded-lg file:border file:border-slate-300 file:bg-white file:text-xs file:cursor-pointer"
          />
        </div>

        {file && (
          <p className="text-xs text-slate-600 text-right w-full">
            קובץ נבחר: <span className="font-semibold">{file.name}</span>
          </p>
        )}

        <div className="flex items-center justify-between w-full mt-2 gap-2">
          <p className="text-[11px] text-slate-500 text-right flex-1">
            הקובץ צריך להכיל את כל שדות המוצר הנדרשים
            <br />
            למשל:{" "}
            <span className="font-semibold">
              title, titleEn, descriptionHtml, overviewHtml, brand, gtin,
              sellerSku, model, currency, price, stock, images,
              categoryFullSlug, warranty, deliveryCost, shippingFrom, length,
              width, height, weightKg
            </span>
          </p>

          <button
            type="button"
            onClick={handleImport}
            disabled={!file || isLoading}
            className="px-4 py-2 rounded-xl bg-[#FF6500] text-[#101010] text-sm disabled:opacity-60 whitespace-nowrap"
          >
            {isLoading ? "מייבא..." : "ייבוא מהקובץ"}
          </button>
        </div>

        {preview && (
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="text-[11px] text-[#FF6500] hover:underline mt-1"
          >
            הצג תצוגה מקדימה לקובץ
          </button>
        )}
      </div>

      {/* מודאל תצוגה מקדימה */}
      {showPreview && preview && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div
            className="bg-white rounded-2xl shadow-xl max-w-5xl w-[95%] max-h-[80vh] flex flex-col border border-slate-200"
            dir="rtl"
          >
            {/* כותרת המודאל */}
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex flex-col items-end">
                <h3 className="text-sm font-semibold text-right">
                  תצוגה מקדימה לקובץ CSV
                </h3>
                <p className="text-[11px] text-slate-500 text-right">
                  מומלץ לעבור על השורות לפני הייבוא – לבדוק מחירים, מלאי,
                  קטגוריות ו־GTIN.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                ✕ סגור
              </button>
            </div>

            {/* תוכן הטבלה */}
            <div className="px-4 py-3 overflow-auto">
              <div className="border border-slate-200 rounded-xl overflow-auto">
                <table className="min-w-full text-[11px] text-right">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-2 py-2 border-b border-slate-200 text-center w-12">
                        #
                      </th>
                      {preview.headers.map((h, idx) => (
                        <th
                          key={idx}
                          className="px-2 py-2 border-b border-slate-200 whitespace-nowrap"
                        >
                          {h || (
                            <span className="text-slate-400">
                              עמודה {idx + 1}
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.slice(0, 50).map((row, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className={
                          rowIdx % 2 === 0 ? "bg-white" : "bg-slate-50"
                        }
                      >
                        <td className="px-2 py-1 border-t border-slate-100 text-center text-[10px] text-slate-500">
                          {rowIdx + 1}
                        </td>
                        {preview.headers.map((_, colIdx) => (
                          <td
                            key={colIdx}
                            className="px-2 py-1 border-t border-slate-100 max-w-[180px] truncate"
                            title={row[colIdx] || ""}
                          >
                            {row[colIdx] || (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {preview.rows.length > 50 && (
                <p className="text-[10px] text-slate-400 text-right mt-2">
                  מוצגות 50 השורות הראשונות מתוך {preview.rows.length} שורות
                  בקובץ.
                </p>
              )}
            </div>

            {/* כפתורי תחתית */}
            <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between gap-3">
              <p className="text-[11px] text-slate-500 text-right">
                אם הכל נראה תקין, ניתן לסגור את התצוגה המקדימה וללחוץ על{" "}
                <span className="font-semibold">"ייבוא מהקובץ"</span>.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-700"
                >
                  סגור
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPreview(false);
                    handleImport();
                  }}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-xl bg-[#FF6500] text-[#101010] text-xs disabled:opacity-60"
                >
                  {isLoading ? "מייבא..." : "ייבוא מהקובץ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* מודאל תוצאות / שגיאות ייבוא */}
      {showResultModal && importResult && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div
            className="bg-white rounded-2xl shadow-xl max-w-3xl w-[95%] max-h-[80vh] flex flex-col border border-slate-200"
            dir="rtl"
          >
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex flex-col items-end">
                <h3 className="text-sm font-semibold text-right">
                  תוצאות ייבוא CSV
                </h3>
                <p className="text-[11px] text-slate-500 text-right">
                  יובאו {importResult.importedCount || 0} מוצרים,{" "}
                  {importResult.failedCount || 0} שורות נכשלו.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowResultModal(false)}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                ✕ סגור
              </button>
            </div>

            <div className="px-4 py-3 overflow-auto">
              {importResult.failedCount > 0 &&
              importResult.failed &&
              importResult.failed.length > 0 ? (
                <>
                  <p className="text-[11px] text-slate-600 text-right mb-2">
                    להלן השורות שנכשלו והסיבה:
                  </p>
                  <div className="border border-slate-200 rounded-xl overflow-auto">
                    <table className="min-w-full text-[11px] text-right">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="px-2 py-2 border-b border-slate-200 w-16">
                            שורה
                          </th>
                          <th className="px-2 py-2 border-b border-slate-200">
                            שגיאה
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {importResult.failed.map((f, idx) => (
                          <tr
                            key={idx}
                            className={
                              idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                            }
                          >
                            <td className="px-2 py-1 border-t border-slate-100 text-center">
                              {f.row}
                            </td>
                            <td className="px-2 py-1 border-t border-slate-100">
                              {f.error}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="text-[11px] text-emerald-600 text-right">
                  כל השורות יובאו בהצלחה, אין כשלונות.
                </p>
              )}
            </div>

            <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowResultModal(false)}
                className="px-3 py-1.5 rounded-xl bg-[#FF6500] text-[#101010] text-xs"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
