// // src/components/UploadGallery.jsx
// import UploadMedia from "./UploadMedia.jsx";

// export default function UploadGallery({ label = "גלריה", value = [], onChange }) {
//   const items = Array.isArray(value) ? value : [];

//   const add = () => onChange([...items, { kind: "image", url: "", alt: "" }]);
//   const update = (i, next) => {
//     const arr = [...items];
//     arr[i] = next; // next עשוי להכיל גם _file
//     onChange(arr);
//   };
//   const remove = (i) => {
//     const arr = [...items];
//     arr.splice(i, 1);
//     onChange(arr);
//   };

//   return (
//     <div className="space-y-2">
//       <div className="text-sm font-medium">{label}</div>
//       <div className="grid md:grid-cols-2 gap-4">
//         {items.map((m, i) => (
//           <div key={i} className="border rounded-lg p-2 relative">
//             <UploadMedia
//               value={m}
//               onChange={(next) => update(i, next)}
//               kinds={["image"]}
//               accept="image/*"
//               hideKindSelector
//             />
//             <button
//               type="button"
//               className="absolute top-2 right-2 text-red-600 text-sm border px-2 py-1 rounded"
//               onClick={() => remove(i)}
//             >
//               ✕
//             </button>
//           </div>
//         ))}
//       </div>
//       <button type="button" onClick={add} className="px-3 py-2 border rounded text-sm hover:bg-slate-50">
//         + הוספת תמונה
//       </button>
//     </div>
//   );
// }



import UploadMedia from "./UploadMedia.jsx";

export default function UploadGallery({ label = "גלריה", value = [], onChange }) {
  const items = Array.isArray(value) ? value : [];
  const add = () => onChange([...items, { kind: "image", url: "", alt: "" }]);
  const update = (i, next) => { const arr = [...items]; arr[i] = next; onChange(arr); };
  const remove = (i) => { const arr = [...items]; arr.splice(i, 1); onChange(arr); };

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{label}</div>
      <div className="grid md:grid-cols-2 gap-4">
        {items.map((m, i) => (
          <div key={i} className="border rounded-lg p-2 relative">
            <UploadMedia value={m} onChange={(next) => update(i, next)} kinds={["image"]} accept="image/*" hideKindSelector />
            <button type="button" className="absolute top-2 right-2 text-red-600 text-sm border px-2 py-1 rounded" onClick={() => remove(i)}>✕</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="px-3 py-2 border rounded text-sm hover:bg-slate-50">+ הוספת תמונה</button>
    </div>
  );
}
