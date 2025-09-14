// components/store/settings/forms/StoreMediaForm.jsx
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import UploadMedia from "../UploadMedia.jsx";
import UploadGallery from "../UploadGallery.jsx";
import { mediaFormSchema, buildDefaultValues } from "../storeSchemas.js";

const Section = ({ title, children }) => (
  <section className="bg-white p-4 rounded-xl shadow space-y-3">
    <h3 className="font-bold text-lg">{title}</h3>
    {children}
  </section>
);

/**
 * טופס מדיה נפרד – מיועד לשמירה/העלאה של לוגו, באנרים וגלריית סליידר
 * onUpload(filesPayload | fullFormData) – אתה שולט אם לשלוח רק קבצים או את כל האובייקט
 */
export default function StoreMediaForm({ initial, submitting, onUpload }) {
  const { control, register, handleSubmit, reset, watch } = useForm({
    resolver: zodResolver(mediaFormSchema),
    mode: "onSubmit",
    shouldFocusError: false,
    defaultValues: buildDefaultValues(initial),
  });

  const bannerTypeStore = watch("bannerTypeStore");
  const bannerTypeList = watch("bannerTypeList");

  useEffect(() => {
    reset(buildDefaultValues(initial));
  }, [initial, reset]);

  const storeKinds = bannerTypeStore === "video" ? ["video"] : ["image"];
  const mobileKinds = storeKinds;
  const listKinds = bannerTypeList === "video" ? ["video"] : ["image"];

  const onSubmit = (data) => {
    // ניתן גם להריץ ריכוז קבצים בלבד אם אתה רוצה לשלוח רק payload של קבצים
    // כאן שולח את כל ה־data ונותן ל־onUpload להחליט מה בדיוק לעלות
    onUpload?.(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <Section title="לוגו ובאנרים">
        <div className="grid md:grid-cols-2 gap-6">
          <Controller
            control={control}
            name="logo"
            render={({ field }) => (
              <UploadMedia
                label="לוגו החנות"
                value={field.value}
                onChange={field.onChange}
                kinds={["image"]}
                accept="auto"
                hideKindSelector
              />
            )}
          />

          <div className="space-y-2">
            <div className="text-sm mb-1">סוג באנר חנות</div>
            <select className="border rounded p-2 w-full" {...register("bannerTypeStore")}>
              <option value="static">תמונה סטטית</option>
              <option value="video">וידאו</option>
              <option value="slider">סליידר</option>
            </select>
          </div>
        </div>

        {bannerTypeStore === "slider" ? (
          <Controller
            control={control}
            name="storeSlider"
            render={({ field }) => (
              <UploadGallery
                label="גלריית סליידר"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        ) : (
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <Controller
              control={control}
              name="storeBanner"
              render={({ field }) => (
                <UploadMedia
                  label="באנר חנות"
                  value={field.value}
                  onChange={field.onChange}
                  kinds={storeKinds}
                  accept="auto"
                  hideKindSelector={storeKinds.length === 1}
                />
              )}
            />
            <Controller
              control={control}
              name="mobileBanner"
              render={({ field }) => (
                <UploadMedia
                  label="באנר נייד"
                  value={field.value}
                  onChange={field.onChange}
                  kinds={mobileKinds}
                  accept="auto"
                  hideKindSelector={mobileKinds.length === 1}
                />
              )}
            />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-2">
            <div className="text-sm mb-1">סוג באנר רשימת חנויות</div>
            <select className="border rounded p-2 w-full" {...register("bannerTypeList")}>
              <option value="static">תמונה סטטית</option>
              <option value="video">וידאו</option>
            </select>
          </div>
          <Controller
            control={control}
            name="listBanner"
            render={({ field }) => (
              <UploadMedia
                label="באנר רשימת חנויות"
                value={field.value}
                onChange={field.onChange}
                kinds={listKinds}
                accept="auto"
                hideKindSelector={listKinds.length === 1}
              />
            )}
          />
        </div>
      </Section>

      <div className="flex justify-end">
        <button type="submit" disabled={submitting} className="bg-teal-700 text-white px-4 py-2 rounded hover:bg-teal-600 disabled:opacity-60">
          {submitting ? "מעלה…" : "שמירת/העלאת מדיה"}
        </button>
      </div>
    </form>
  );
}
