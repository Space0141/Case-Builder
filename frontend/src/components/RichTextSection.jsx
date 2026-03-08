import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";

export default function RichTextSection({ label, value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit, Table.configure({ resizable: true }), TableRow, TableHeader, TableCell],
    content: value || "",
    onUpdate: ({ editor: current }) => onChange(current.getHTML())
  });

  if (!editor) return null;

  const run = (command) => () => command(editor.chain().focus()).run();

  return (
    <section className="card p-4">
      <h3 className="font-semibold mb-3">{label}</h3>
      <div className="flex flex-wrap gap-2 mb-3 text-xs">
        <button className="button-muted" onClick={run((c) => c.toggleBold())}>Bold</button>
        <button className="button-muted" onClick={run((c) => c.toggleItalic())}>Italic</button>
        <button className="button-muted" onClick={run((c) => c.toggleHeading({ level: 2 }))}>H2</button>
        <button className="button-muted" onClick={run((c) => c.toggleBulletList())}>Bullets</button>
        <button className="button-muted" onClick={run((c) => c.toggleOrderedList())}>Numbered</button>
        <button className="button-muted" onClick={run((c) => c.sinkListItem("listItem"))}>Indent +</button>
        <button className="button-muted" onClick={run((c) => c.liftListItem("listItem"))}>Indent -</button>
        <button className="button-muted" onClick={run((c) => c.insertTable({ rows: 3, cols: 3, withHeaderRow: true }))}>Table</button>
      </div>
      <div className="border border-slate-700 rounded-md p-3 min-h-40 bg-slate-950 [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-32">
        <EditorContent editor={editor} />
      </div>
    </section>
  );
}
