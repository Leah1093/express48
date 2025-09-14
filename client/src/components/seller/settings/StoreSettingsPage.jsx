// components/store/settings/StoreSettingsPage.jsx
import SettingsTabs from "./SettingsTabs.jsx";
import StoreGeneralForm from "./forms/StoreGeneralForm.jsx";
import StoreMediaForm from "./forms/StoreMediaForm.jsx";
import StoreSlugForm from "./forms/StoreSlugForm.jsx";

// אפשר לייבא כאן את ה־API שלך (או להעביר handlers כ־props מהעמוד)
import { uploadStoreMedia } from "./storeApi.js";

export default function StoreSettingsPage({
  initial,
  isDraft,
  submittingGeneral = false,
  submittingMedia = false,
  submittingSlug = false,
  onSaveGeneral,     // async (data) => { ... }
  onUploadMedia,     // async (data) => { ... } — אם לא מועבר, יש ברירת מחדל
  onSaveSlug,        // async (data) => { ... }
  onCustomSlug,      // (slug) => { ... }
}) {
  // ברירת מחדל להעלאת מדיה דרך API קיים שלך, ניתן להחליף מבחוץ
  const handleUploadMedia = async (data) => {
    if (onUploadMedia) return onUploadMedia(data);

    // דוגמה: התאמת payload לקבצים והעלאה
    const files = {
      logo: data?.logo?._file,
      storeBanner: data?.storeBanner?._file,
      mobileBanner: data?.mobileBanner?._file,
      listBanner: data?.listBanner?._file,
      slider: Array.isArray(data?.storeSlider)
        ? data.storeSlider.map((m) => m?._file).filter(Boolean)
        : [],
    };

    const anyFile =
      !!files.logo ||
      !!files.storeBanner ||
      !!files.mobileBanner ||
      !!files.listBanner ||
      (files.slider && files.slider.length > 0);

    if (!anyFile) {
      alert("לא נבחרו קבצים להעלאה.");
      return;
    }

    const res = await uploadStoreMedia({
      bannerTypeStore: data?.bannerTypeStore || "static",
      bannerTypeList: data?.bannerTypeList || "static",
      replaceSlider: false,
      files,
    });

    if (res?.store) {
      // במידת הצורך: לעדכן סטייט הורה/רידאקס עם res.store
    }
    alert("המדיה הועלתה ונשמרה");
  };

  return (
    <div className="space-y-6">
      <SettingsTabs
        labels={["כללי", "מדיה", "סלוג"]}
        initialActive={0}
      >
        {/* טאבה 1 – כללי */}
        <div className="space-y-6">
          <StoreGeneralForm
            initial={initial}
            submitting={submittingGeneral}
            onSubmit={onSaveGeneral}
          />
        </div>

        {/* טאבה 2 – מדיה (שמירה/העלאה נפרדת) */}
        <div className="space-y-6">
          <StoreMediaForm
            initial={initial}
            submitting={submittingMedia}
            onUpload={handleUploadMedia}
          />
        </div>

        {/* טאבה 3 – סלוג (שמירה נפרדת) */}
        <div className="space-y-6">
          <StoreSlugForm
            initial={initial}
            isDraft={isDraft}
            submitting={submittingSlug}
            onSaveSlug={onSaveSlug}
            onCustomSlug={onCustomSlug}
          />
        </div>
      </SettingsTabs>
    </div>
  );
}
