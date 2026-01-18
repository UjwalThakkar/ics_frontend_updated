// // src/components/ui/TipTapEditor.tsx
// "use client";

// import { useEditor, EditorContent } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import Link from "@tiptap/extension-link";
// import Image from "@tiptap/extension-image";
// import Placeholder from "@tiptap/extension-placeholder";
// import {
//   Bold,
//   Italic,
//   List,
//   ListOrdered,
//   Link2,
//   Image as ImageIcon,
//   Undo,
//   Redo,
// } from "lucide-react";

// interface TipTapEditorProps {
//   value: string;
//   onChange: (value: string) => void;
//   placeholder?: string;
//   className?: string;
// }

// export default function TipTapEditor({
//   value,
//   onChange,
//   placeholder = "Write something...",
//   className = "",
// }: TipTapEditorProps) {
//   const editor = useEditor({
//     extensions: [
//       StarterKit.configure({
//         heading: { levels: [1, 2, 3] },
//       }),
//       Link.configure({
//         openOnClick: false,
//         HTMLAttributes: { class: "text-blue-600 underline" },
//       }),
//       Image.configure({
//         HTMLAttributes: { class: "rounded-md max-w-full h-auto" },
//       }),
//       Placeholder.configure({ placeholder }),
//     ],
//     content: value,
//     onUpdate: ({ editor }) => {
//       onChange(editor.getHTML());
//     },

//     immediatelyRender: false,
//     editorProps: {
//       attributes: {
//         class:
//           "prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4 border rounded-lg",
//       },
//     },
//   });

//   if (!editor) return null;

//   const addLink = () => {
//     const url = window.prompt("Enter URL:");
//     if (url) {
//       editor.chain().focus().setLink({ href: url }).run();
//     }
//   };

//   const addImage = () => {
//     const url = window.prompt("Enter Image URL:");
//     if (url) {
//       editor.chain().focus().setImage({ src: url }).run();
//     }
//   };

//   return (
//     <div className={`border rounded-lg ${className}`}>
//       <div className="flex flex-wrap gap-2 p-3 border-b bg-gray-50">
//         <button
//           onClick={() => editor.chain().focus().toggleBold().run()}
//           className={`p-2 rounded hover:bg-gray-200 ${
//             editor.isActive("bold") ? "bg-gray-300" : ""
//           }`}
//           title="Bold"
//         >
//           <Bold className="h-4 w-4" />
//         </button>
//         <button
//           onClick={() => editor.chain().focus().toggleItalic().run()}
//           className={`p-2 rounded hover:bg-gray-200 ${
//             editor.isActive("italic") ? "bg-gray-300" : ""
//           }`}
//           title="Italic"
//         >
//           <Italic className="h-4 w-4" />
//         </button>
//         <button
//           onClick={() => editor.chain().focus().toggleBulletList().run()}
//           className={`p-2 rounded hover:bg-gray-200 ${
//             editor.isActive("bulletList") ? "bg-gray-300" : ""
//           }`}
//           title="Bullet List"
//         >
//           <List className="h-4 w-4" />
//         </button>
//         <button
//           onClick={() => editor.chain().focus().toggleOrderedList().run()}
//           className={`p-2 rounded hover:bg-gray-200 ${
//             editor.isActive("orderedList") ? "bg-gray-300" : ""
//           }`}
//           title="Numbered List"
//         >
//           <ListOrdered className="h-4 w-4" />
//         </button>
//         <button
//           onClick={addLink}
//           className={`p-2 rounded hover:bg-gray-200 ${
//             editor.isActive("link") ? "bg-gray-300" : ""
//           }`}
//           title="Link"
//         >
//           <Link2 className="h-4 w-4" />
//         </button>
//         <button
//           onClick={addImage}
//           className="p-2 rounded hover:bg-gray-200"
//           title="Image"
//         >
//           <ImageIcon className="h-4 w-4" />
//         </button>
//         <div className="border-l pl-2 ml-auto flex gap-2">
//           <button
//             onClick={() => editor.chain().focus().undo().run()}
//             disabled={!editor.can().undo()}
//             className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
//           >
//             <Undo className="h-4 w-4" />
//           </button>
//           <button
//             onClick={() => editor.chain().focus().redo().run()}
//             disabled={!editor.can().redo()}
//             className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
//           >
//             <Redo className="h-4 w-4" />
//           </button>
//         </div>
//       </div>
//       <EditorContent editor={editor} />
//     </div>
//   );
// }

// src/components/ui/TipTapEditor.tsx
// src/components/ui/TipTapEditor.tsx
"use client";

import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Quote,
  Table as TableIcon,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Merge,
  Split,
  PanelTop,
  PanelLeft,
} from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  onEditorReady?: (editor: any) => void;
}

export default function TipTapEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  minHeight = "300px",
  onEditorReady,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      LinkExtension.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder }),
      TableKit,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none focus:outline-none p-4 border rounded-b-lg",
        style: `min-height: ${minHeight};`,
      },
    },
  });

  // Expose editor instance to parent via callback
  React.useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  if (!editor) return null;

  const setLink = () => {
    const url = prompt("Enter URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const setImage = () => {
    const url = prompt("Enter Image URL:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex flex-wrap gap-1 p-3 bg-gray-50 border-b">
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("heading", { level: 1 }) ? "bg-gray-300" : ""
            }`}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("heading", { level: 2 }) ? "bg-gray-300" : ""
            }`}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("bold") ? "bg-gray-300" : ""
            }`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("italic") ? "bg-gray-300" : ""
            }`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("bulletList") ? "bg-gray-300" : ""
            }`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("orderedList") ? "bg-gray-300" : ""
            }`}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("blockquote") ? "bg-gray-300" : ""
            }`}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={setLink}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("link") ? "bg-gray-300" : ""
            }`}
          title="Link"
        >
          <Link2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={setImage}
          className="p-2 rounded hover:bg-gray-200"
          title="Insert Image"
        >
          <ImageIcon className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("table") ? "bg-gray-300" : ""
            }`}
          title="Insert Table"
        >
          <TableIcon className="h-4 w-4" />
        </button>

        <div className="ml-auto flex gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Contextual Table Toolbar */}
      {editor.isActive("table") && (
        <div className="flex flex-wrap gap-1 p-2 bg-blue-50 border-b items-center text-sm">
          <span className="text-xs font-semibold text-blue-800 mr-2 uppercase tracking-wide">
            Table Tools:
          </span>

          <div className="flex gap-1 border-r border-blue-200 pr-2 mr-2">
            <button
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              className="p-1.5 rounded hover:bg-blue-200 text-blue-700"
              title="Add Column Before"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="p-1.5 rounded hover:bg-blue-200 text-blue-700"
              title="Add Column After"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="p-1.5 rounded hover:bg-red-200 text-red-600"
              title="Delete Column"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex gap-1 border-r border-blue-200 pr-2 mr-2">
            <button
              onClick={() => editor.chain().focus().addRowBefore().run()}
              className="p-1.5 rounded hover:bg-blue-200 text-blue-700"
              title="Add Row Before"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="p-1.5 rounded hover:bg-blue-200 text-blue-700"
              title="Add Row After"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="p-1.5 rounded hover:bg-red-200 text-red-600"
              title="Delete Row"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex gap-1 border-r border-blue-200 pr-2 mr-2">
            <button
              onClick={() => editor.chain().focus().mergeCells().run()}
              className="p-1.5 rounded hover:bg-blue-200 text-blue-700"
              title="Merge Cells"
            >
              <Merge className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => editor.chain().focus().splitCell().run()}
              className="p-1.5 rounded hover:bg-blue-200 text-blue-700"
              title="Split Cell"
            >
              <Split className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex gap-1 border-r border-blue-200 pr-2 mr-2">
            <button
              onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
              className={`p-1.5 rounded hover:bg-blue-200 ${editor.isActive("isHeaderColumn")
                ? "bg-blue-200 text-blue-900"
                : "text-blue-700"
                }`}
              title="Toggle Header Column"
            >
              <PanelLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeaderRow().run()}
              className={`p-1.5 rounded hover:bg-blue-200 ${editor.isActive("isHeaderRow")
                ? "bg-blue-200 text-blue-900"
                : "text-blue-700"
                }`}
              title="Toggle Header Row"
            >
              <PanelTop className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeaderCell().run()}
              className="p-1.5 rounded hover:bg-blue-200 text-blue-700"
              title="Toggle Header Cell"
            >
              <span className="font-bold text-xs">H</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete the entire table?")) {
                editor.chain().focus().deleteTable().run();
              }
            }}
            className="p-1.5 rounded hover:bg-red-200 text-red-600 ml-auto"
            title="Delete Table"
          >
            <span className="text-xs font-bold px-1">DELETE TABLE</span>
          </button>
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}

