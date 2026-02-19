"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect } from "react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Image as ImageIcon,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Code,
  Quote,
  CheckSquare,
} from "lucide-react";
import { Button } from "./button";
import { cn } from "@/libs/utils";

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt("URL de la imagen:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL del enlace:", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/30 sticky top-0 z-10 backdrop-blur-sm">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(editor.isActive("bold") && "bg-muted text-primary")}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(editor.isActive("italic") && "bg-muted text-primary")}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={cn(editor.isActive("underline") && "bg-muted text-primary")}
      >
        <UnderlineIcon className="h-4 w-4" />
      </Button>
      <div className="w-px h-8 bg-border mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cn(
          editor.isActive("heading", { level: 1 }) && "bg-muted text-primary",
        )}
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(
          editor.isActive("heading", { level: 2 }) && "bg-muted text-primary",
        )}
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <div className="w-px h-8 bg-border mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(editor.isActive("bulletList") && "bg-muted text-primary")}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          editor.isActive("orderedList") && "bg-muted text-primary",
        )}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={cn(editor.isActive("taskList") && "bg-muted text-primary")}
      >
        <CheckSquare className="h-4 w-4" />
      </Button>
      <div className="w-px h-8 bg-border mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={cn(editor.isActive("codeBlock") && "bg-muted text-primary")}
      >
        <Code className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn(editor.isActive("blockquote") && "bg-muted text-primary")}
      >
        <Quote className="h-4 w-4" />
      </Button>
      <div className="w-px h-8 bg-border mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={setLink}
        className={cn(editor.isActive("link") && "bg-muted text-primary")}
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={addImage}>
        <ImageIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

export const TiptapEditor = ({
  content,
  onChange,
  placeholder,
}: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline cursor-pointer" },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-lg border max-w-full h-auto my-4" },
      }),
      Placeholder.configure({
        placeholder: placeholder || "Escribe algo increíble...",
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert focus:outline-none max-w-none min-h-[150px] p-4",
      },
    },
    immediatelyRender: false,
  });

  // Handle external content changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="w-full border rounded-xl overflow-hidden bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40 transition-all">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};
