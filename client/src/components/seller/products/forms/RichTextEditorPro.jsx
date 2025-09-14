import { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import DOMPurify from "dompurify";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";

/**
 * עורך טקסט מתקדם – RTL, מחובר ל-react-hook-form
 * props:
 *  - name: שם השדה בטופס (למשל "overview")
 *  - label?: תווית
 *  - placeholder?: טקסט רמז
 *  - minHeight?: גובה מינימלי (px)
 *  - maxChars?: הגבלת תווים (אופציונלי)
 */
export default function RichTextEditorPro({
  name = "overview",
  label = "תיאור",
  placeholder = "כתבי כאן תיאור ברור ומסודר...",
  minHeight = 160,
  maxChars = 5000,
}) {
  const {
    register, setValue, watch,
    formState: { errors },
  } = useFormContext();

  const externalValue = watch(name) || "";

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        blockquote: true,
        codeBlock: true,
        horizontalRule: true,
        history: true,
      }),
      Underline,
      Link.configure({
        openOnClick: true,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer nofollow" },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: "right",
      }),
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: maxChars }),
    ],
    content: externalValue,
    editorProps: {
      attributes: {
        dir: "rtl",
        class:
          "prose prose-sm max-w-none focus:outline-none rtl text-right",
      },
      handlePaste(view, event) {
        // הדבקה נקייה (מסירה עיצובי ענק מ־Word/Docs)
        const html = event.clipboardData?.getData("text/html");
        if (html) {
          event.preventDefault();
          const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
          view.dispatch(view.state.tr.insertText(""));
          view.dom.focus();
          editor.commands.insertContent(clean);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const safe = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
      setValue(name, safe, { shouldDirty: true, shouldValidate: true });
    },
  });

  // רישום השדה ל-RHF
  useEffect(() => {
    register(name);
  }, [register, name]);

  // סנכרון חד־פעמי לעריכה קיימת
  useEffect(() => {
    if (editor && editor.getHTML() !== externalValue) {
      editor.commands.setContent(externalValue || "", false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) return null;

  const err = useMemo(() => {
    const parts = name.split(".");
    return parts.reduce((acc, k) => (acc ? acc[k] : undefined), errors);
  }, [errors, name]);

  const addOrEditLink = () => {
    const prev = editor.getAttributes("link")?.href || "";
    const url = window.prompt("כתובת קישור (URL):", prev);
    if (url === null) return;
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  const clearFormatting = () => {
    editor.chain().focus()
      .clearMarks()
      .unsetAllMarks()
      .setParagraph()
      .run();
  };

  const count = editor.storage.characterCount;
  const words = editor.getText().trim() ? editor.getText().trim().split(/\s+/).length : 0;

  return (
    <section dir="rtl" className="bg-white rounded-2xl p-4 border shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium">{label}</h2>
        <div className="text-xs text-gray-500">
          {count.characters()}/{maxChars} תווים • {words} מילים
        </div>
      </div>

      {/* טולבר דביק */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border rounded-xl p-2 bg-gray-50">
        {/* סגנון */}
        <select
          onChange={(e) => {
            const v = e.target.value;
            if (v === "p") editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: Number(v) }).run();
          }}
          className="h-8 rounded-md border px-2 bg-white text-sm"
          defaultValue="p"
          title="סגנון טקסט"
        >
          <option value="p">פסקה רגילה</option>
          <option value="1">כותרת 1</option>
          <option value="2">כותרת 2</option>
          <option value="3">כותרת 3</option>
        </select>

        <Divider />

        <Btn a={editor.isActive("bold")} on={() => editor.chain().focus().toggleBold().run()} t="מודגש" l="B" />
        <Btn a={editor.isActive("italic")} on={() => editor.chain().focus().toggleItalic().run()} t="נטוי" l={<span className="italic">I</span>} />
        <Btn a={editor.isActive("underline")} on={() => editor.chain().focus().toggleUnderline().run()} t="קו תחתון" l="U" />
        <Btn a={editor.isActive("strike")} on={() => editor.chain().focus().toggleStrike().run()} t="קו מחיקה" l="S" />
        <Btn a={editor.isActive("code")} on={() => editor.chain().focus().toggleCode().run()} t="קוד" l="</>" />
        <Btn a={editor.isActive("blockquote")} on={() => editor.chain().focus().toggleBlockquote().run()} t="ציטוט" l="“ ”" />
        <Btn on={() => editor.chain().focus().setHorizontalRule().run()} t="קו מפריד" l="—" />

        <Divider />

        <Btn a={editor.isActive({ textAlign: "right" })} on={() => editor.chain().focus().setTextAlign("right").run()} t="יישור לימין" l="〉〉" />
        <Btn a={editor.isActive({ textAlign: "center" })} on={() => editor.chain().focus().setTextAlign("center").run()} t="יישור למרכז" l="↔" />
        <Btn a={editor.isActive({ textAlign: "left" })} on={() => editor.chain().focus().setTextAlign("left").run()} t="יישור לשמאל" l="〈〈" />
        <Btn a={editor.isActive({ textAlign: "justify" })} on={() => editor.chain().focus().setTextAlign("justify").run()} t="יישור דו־צדדי" l="≋" />

        <Divider />

        <Btn a={editor.isActive("bulletList")} on={() => editor.chain().focus().toggleBulletList().run()} t="רשימת תבליטים" l="•" />
        <Btn a={editor.isActive("orderedList")} on={() => editor.chain().focus().toggleOrderedList().run()} t="רשימה ממוספרת" l="1." />

        <Divider />

        <Btn on={addOrEditLink} t="הוספת קישור" l="🔗" />
        <Btn on={() => editor.chain().focus().unsetLink().run()} t="הסרת קישור" l="⛔" />

        <Divider />

        <Btn on={() => editor.chain().focus().undo().run()} t="בטל" l="↶" />
        <Btn on={() => editor.chain().focus().redo().run()} t="בצע שוב" l="↷" />

        <Divider />

        <Btn on={clearFormatting} t="ניקוי עיצוב" l="✖" />
      </div>

      {/* העורך */}
      <div
        className="rounded-xl border p-3 bg-white mt-2"
        style={{ minHeight }}
        onClick={() => editor?.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </div>

      {err?.message ? <p className="text-red-600 text-xs mt-1">{err.message}</p> : null}
    </section>
  );
}

function Divider() {
  return <div className="w-px h-6 bg-gray-300 mx-1" />;
}

function Btn({ on, l, t, a }) {
  return (
    <button
      type="button"
      onClick={on}
      title={t}
      className={`h-8 px-2 rounded-md text-sm border
        ${a ? "bg-blue-50 border-blue-300" : "bg-white border-gray-300 hover:bg-gray-100"}`}
    >
      {l}
    </button>
  );
}
