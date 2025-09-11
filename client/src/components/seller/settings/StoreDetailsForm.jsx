// /components/forms/StoreDetailsForm.jsx
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { baseStoreSchema } from "../../schemas/storeSchemas";


export default function StoreDetailsForm({ initial, onSubmit, submitting }) {
const methods = useForm({ resolver: zodResolver(baseStoreSchema), mode: "onSubmit", defaultValues: initial || { name: "", contactEmail: "", phone: "", support: { email: "", phone: "", whatsapp: "", hours: "", note: "" }, appearance: { storeNamePosition: "header", productsPerPage: 24, hideEmail: false, hidePhone: false, hideAddress: false, hideAbout: false }, policies: { about: "", shipping: "", returns: "", privacy: "", terms: "" }, description: "", status: "draft" }, });
const { register, handleSubmit, formState: { errors } } = methods;
return (
<FormProvider {...methods}>
<form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
{/* פרטים כלליים */}
<section className="bg-white p-4 rounded-xl shadow space-y-3">...</section>
{/* שירות לקוחות */}
<section className="bg-white p-4 rounded-xl shadow space-y-3">...</section>
{/* נראות */}
<section className="bg-white p-4 rounded-xl shadow space-y-3">...</section>
{/* תיאור ומדיניות */}
<section className="bg-white p-4 rounded-xl shadow space-y-3">...</section>
<div className="flex justify-end">
<button type="submit" disabled={submitting} className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 disabled:opacity-60">
{submitting ? "שומר…" : "שמירת פרטי חנות"}
</button>
</div>
</form>
</FormProvider>
);
}