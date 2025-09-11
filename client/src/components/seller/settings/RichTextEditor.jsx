import { useMemo } from "react";
import { Editor } from "@tinymce/tinymce-react";

export default function RichTextEditor({ label = "תיאור", value, onChange, onAddMedia }) {
  const init = useMemo(() => ({
    height: 260,
    menubar: false,
    directionality: "rtl",
    language: "he-IL",
    plugins: "link lists image code",
    toolbar: "undo redo | blocks | bold italic underline | alignright aligncenter alignleft | bullist numlist | link image | removeformat | code",
    content_style: "body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,'Apple Color Emoji','Segoe UI Emoji'}",
    file_picker_types: "image media",
    file_picker_callback: (cb) => {
      const url = window.prompt("הדבק כתובת URL של תמונה/וידאו:");
      if (url) cb(url, { title: "media" });
    },
    autofocus: false,
    autosave_ask_before_unload: false,
  }), []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{label}</div>
        {onAddMedia && (
          <button type="button" onClick={onAddMedia} className="text-sm px-2 py-1 border rounded hover:bg-slate-50">
            הוספת מדיה
          </button>
        )}
      </div>
      <Editor apiKey="fi7tw35h6qmxm0thi4az6l9gaxjs7efqk0qy6hsdw4lgckr1" value={value || ""} onEditorChange={onChange} init={init} />
    </div>
  );
}
