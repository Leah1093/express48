import { useFormContext } from "react-hook-form";
// import RichTextEditorPro from "@/components/common/RichTextEditorPro";
import RichTextEditorPro from "./RichTextEditorPro";
export default function ProductDescriptionSection() {
  useFormContext(); // רק כדי לוודא שמרונדר בתוך FormProvider
  return (
    <section dir="rtl" className="bg-white rounded-2xl p-4 border shadow-sm">
      <RichTextEditorPro name="description" label="תיאור מלא" />
    </section>
  );
}
