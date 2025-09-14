import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { storeMediaSchema } from "../../validations/storeSchemas";
import UploadMedia from "../../components/UploadMedia";
import UploadGallery from "../../components/UploadGallery";
import { uploadStoreMedia } from "../../api/storeApi";

const Section = ({ title, children }) => (
  <section className="bg-white p-4 rounded-xl shadow space-y-3">
    <h3 className="font-bold text-lg">{title}</h3>
    {children}
  </section>
);

export default function StoreMediaForm({
  initial,
  onUploaded, // לקבל עדכון store מהשרת אחרי העלאה
}) {
  const { control, register, handleSubmit, reset, getValues } = useForm({
    resolver: zodResolver(storeMediaSchema),
    defaultValues: {
      bannerTypeStore: initial?.bannerTypeStore || "static",
      storeBanner: initial?.storeBanner || { kind: "image", url: "", alt: "" },
      mobileBanner: initial?.mobileBanner || { kind: "image", url: "", alt: "" },
      storeSlider: initial?.storeSlider || [],
      bannerTypeList: initial?.bannerTypeList || "static",
      listBanner: initial?.listBanner || { kind: "image", url: "", alt: "" },
      logo: initial?.logo || { kind: "image", url: "", alt: "" },
    },
  });

  const [typeStore, setTypeStore] = useState(initial?.bannerTypeStore || "static");
  const [typeList, setTypeList] = useState(initial?.bannerTypeList || "static");

  const submitMedia = async (data) => {
    const files = {
      logo: data?.logo?._file,
      storeBanner: data?.storeBanner?._file,
      mobileBanner: data?.mobileBanner?._file,
      listBanner: data?.listBanner?._file,
      slider: Array.isArray(data?.storeSlider) ? data.storeSlider.map(m => m?._file).filter(Boolean) : [],
    };
    const anyFile = !!files.logo || !!files.storeBanner || !!files.mobileBanner || !!files.listBanner || (files.slider?.length > 0);
    if (!anyFile) return alert("לא נבחרו קבצים להעלאה.");

    try {
      const res = await uploadStoreMedia({
        bannerTypeStore: data.bannerTypeStore || "static",
        bannerTypeList: data.bannerTypeList || "static",
        replaceSlider: false,
        files,
      });
      if (res?.store) {
        reset(res.store);
        setTypeStore(res.store.bannerTypeStore || "static");
        setTypeList(res.store.bannerTypeList || "static");
        onUploaded?.(res.store);
      }
      alert("המדיה הועלתה ונשמרה");
    } catch (e) {
      console.error(e);
      alert("העלאת מדיה נכשלה");
    }
  };

  const bannerKinds = {
    store: typeStore === "video" ? ["video"] : ["image"],
    mobile: typeStore === "video" ? ["video"] : ["image"],
    list: typeList === "video" ? ["video"] : ["image"],
  };

  return (
    <form onSubmit={handleSubmit(submitMedia)} className="space-y-6" noValidate>
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
              {...register("bannerTypeStore")}
              onChange={(e) => { register("bannerTypeStore").onChange(e); setTypeStore(e.target.value); }}
            >
              <option value="static">תמונה סטטית</option>
              <option value="video">וידאו</option>
              <option value="slider">סליידר</option>
            </select>
          </div>
        </div>

        {typeStore === "slider" ? (
          <Controller control={control} name="storeSlider"
            render={({ field }) => <UploadGallery label="גלריית סליידר" value={field.value} onChange={field.onChange} />} />
        ) : (
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <Controller
              control={control}
              name="storeBanner"
              render={({ field }) => (
                <UploadMedia label="באנר חנות" value={field.value} onChange={field.onChange} kinds={bannerKinds.store} accept="auto" hideKindSelector={bannerKinds.store.length === 1} />
              )}
            />
            <Controller
              control={control}
              name="mobileBanner"
              render={({ field }) => (
                <UploadMedia label="באנר נייד" value={field.value} onChange={field.onChange} kinds={bannerKinds.mobile} accept="auto" hideKindSelector={bannerKinds.mobile.length === 1} />
              )}
            />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <div className="text-sm mb-1">סוג באנר רשימת חנויות</div>
          <select
            className="border rounded p-2 w-full"
            {...register("bannerTypeList")}
            onChange={(e) => { register("bannerTypeList").onChange(e); setTypeList(e.target.value); }}
          >
            <option value="static">תמונה סטטית</option>
            <option value="video">וידאו</option>
          </select>

          <Controller
            control={control}
            name="listBanner"
            render={({ field }) => (
              <UploadMedia label="באנר רשימת חנות" value={field.value} onChange={field.onChange} kinds={bannerKinds.list} accept="auto" hideKindSelector={bannerKinds.list.length === 1} />
            )}
          />
        </div>
      </Section>

      <div className="flex justify-end gap-3">
        <button type="submit" className="bg-teal-700 text-white px-4 py-2 rounded hover:bg-teal-600">
          העלאת מדיה
        </button>
      </div>
    </form>
  );
}
