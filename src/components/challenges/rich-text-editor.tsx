"use client";

import { useEffect } from "react";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { RichTextToolbar } from "./rich-text-toolbar";

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose-challenge max-w-full min-h-48 break-words px-3 py-3 focus:outline-none md:min-h-72 md:px-4",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div className="flex min-h-0 min-w-0 max-w-full flex-col overflow-hidden">
      <RichTextToolbar editor={editor} />
      <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
        <EditorContent editor={editor} className="max-w-full [&_.ProseMirror]:max-w-full" />
      </div>
    </div>
  );
}
