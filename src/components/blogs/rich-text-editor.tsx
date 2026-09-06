"use client";

import { useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Heading4,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  RectangleHorizontal,
  Table as TableIcon,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadImageFile } from "@/lib/authenticated-upload";
import "./blog-editor.css";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
};

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Underline,
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: { class: "blog-inline-image" },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({
        placeholder: "Write the article…",
      }),
      TableKit.configure({
        table: { resizable: true },
      }),
    ],
    content: value || "<p></p>",
    onUpdate: ({ editor: instance }) => {
      onChange(instance.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "blog-editor-content min-h-[420px] max-w-none px-5 py-6 text-[15px] leading-7 outline-none",
      },
    },
  });

  const insertImage = async (file: File) => {
    if (!editor) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image");
      return;
    }
    try {
      const url = await uploadImageFile(file, "blogs");
      const alt = window.prompt("Image alt text") || "";
      const caption = window.prompt("Image caption (optional)") || "";
      editor
        .chain()
        .focus()
        .setImage({ src: url, alt, title: caption })
        .run();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    }
  };

  const setLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("Link URL", previous || "https://");
    if (href === null) return;
    if (!href) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    if (!/^https?:\/\//i.test(href)) {
      toast.error("Use a full URL starting with http:// or https://");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  };

  const insertButton = () => {
    if (!editor) return;
    const href = window.prompt("Button URL", "https://www.vivexatech.in/contact");
    const label = window.prompt("Button label", "Start a project");
    if (!href || !label) return;
    if (!/^https?:\/\//i.test(href)) {
      toast.error("Use a full URL starting with http:// or https://");
      return;
    }
    editor
      .chain()
      .focus()
      .insertContent(
        `<p><a href="${href}" class="blog-cta" target="_blank" rel="noopener noreferrer">${label}</a></p>`,
      )
      .run();
  };

  if (!editor) {
    return (
      <div className="min-h-[420px] rounded-2xl border border-border bg-muted/30" />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap gap-1 border-b border-border bg-muted/40 p-2">
        <Tool
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          label="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Tool>
        <Tool
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          label="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Tool>
        <Tool
          active={editor.isActive("heading", { level: 4 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          label="Heading 4"
        >
          <Heading4 className="h-4 w-4" />
        </Tool>
        <Tool
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          label="Bold"
        >
          <Bold className="h-4 w-4" />
        </Tool>
        <Tool
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          label="Italic"
        >
          <Italic className="h-4 w-4" />
        </Tool>
        <Tool
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          label="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Tool>
        <Tool
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          label="Bullet list"
        >
          <List className="h-4 w-4" />
        </Tool>
        <Tool
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          label="Numbered list"
        >
          <ListOrdered className="h-4 w-4" />
        </Tool>
        <Tool
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          label="Quote"
        >
          <Quote className="h-4 w-4" />
        </Tool>
        <Tool
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          label="Code block"
        >
          <Code className="h-4 w-4" />
        </Tool>
        <Tool onClick={() => editor.chain().focus().setHorizontalRule().run()} label="Separator">
          <Minus className="h-4 w-4" />
        </Tool>
        <Tool active={editor.isActive("link")} onClick={setLink} label="Link">
          <Link2 className="h-4 w-4" />
        </Tool>
        <Tool onClick={() => fileRef.current?.click()} label="Insert image">
          <ImagePlus className="h-4 w-4" />
        </Tool>
        <Tool onClick={insertButton} label="Insert button">
          <RectangleHorizontal className="h-4 w-4" />
        </Tool>
        <Tool
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          label="Insert table"
        >
          <TableIcon className="h-4 w-4" />
        </Tool>
        <Tool onClick={() => editor.chain().focus().undo().run()} label="Undo">
          <Undo2 className="h-4 w-4" />
        </Tool>
        <Tool onClick={() => editor.chain().focus().redo().run()} label="Redo">
          <Redo2 className="h-4 w-4" />
        </Tool>
      </div>
      <EditorContent editor={editor} />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void insertImage(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}

function Tool({
  children,
  onClick,
  active,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  label: string;
}) {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn("h-8 w-8", active && "bg-accent text-accent-foreground")}
    >
      {children}
    </Button>
  );
}
