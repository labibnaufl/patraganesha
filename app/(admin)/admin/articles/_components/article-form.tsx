"use client";

import { useActionState, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Minus,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
} from "lucide-react";

type Tag = { id: string; name: string };

type Article = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  coverImage?: string | null;
  status: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string[];
  tags: { tagId: string }[];
};

type Props = {
  action: (
    prevState: { error?: string } | undefined,
    formData: FormData,
  ) => Promise<{ error?: string } | undefined>;
  tags: Tag[];
  article?: Article;
};

// ==================
// Toolbar button
// ==================
function ToolbarBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded hover:bg-accent transition-colors ${active ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}
    >
      {children}
    </button>
  );
}

// ==================
// TipTap Toolbar
// ==================
function EditorToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("Masukkan URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("Masukkan URL gambar:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-muted/30">
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Bold"
      >
        <Bold className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italic"
      >
        <Italic className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="Strikethrough"
      >
        <Strikethrough className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        title="Inline Code"
      >
        <Code className="size-4" />
      </ToolbarBtn>

      <span className="w-px h-5 bg-border mx-1" />

      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        <Heading3 className="size-4" />
      </ToolbarBtn>

      <span className="w-px h-5 bg-border mx-1" />

      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Bullet List"
      >
        <List className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Ordered List"
      >
        <ListOrdered className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="Blockquote"
      >
        <Quote className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        active={false}
        title="Horizontal Rule"
      >
        <Minus className="size-4" />
      </ToolbarBtn>

      <span className="w-px h-5 bg-border mx-1" />

      <ToolbarBtn
        onClick={addLink}
        active={editor.isActive("link")}
        title="Add Link"
      >
        <LinkIcon className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn onClick={addImage} active={false} title="Add Image URL">
        <ImageIcon className="size-4" />
      </ToolbarBtn>

      <span className="w-px h-5 bg-border mx-1" />

      <ToolbarBtn
        onClick={() => editor.chain().focus().undo().run()}
        active={false}
        title="Undo"
      >
        <Undo className="size-4" />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().redo().run()}
        active={false}
        title="Redo"
      >
        <Redo className="size-4" />
      </ToolbarBtn>
    </div>
  );
}

// ==================
// Main Form
// ==================
export function ArticleForm({ action, tags, article }: Props) {
  const [state, formAction, isPending] = useActionState(action, undefined);

  const [coverPreview, setCoverPreview] = useState<string>(
    article?.coverImage ?? "",
  );
  const [coverUrl, setCoverUrl] = useState<string>(article?.coverImage ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [contentHtml, setContentHtml] = useState(article?.content ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      ImageExtension,
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Mulai menulis artikel..." }),
    ],
    content: article?.content ?? "",
    onUpdate: ({ editor }) => {
      setContentHtml(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[320px] p-4 outline-none focus:outline-none",
      },
    },
  });

  const selectedTagIds = article?.tags.map((t) => t.tagId) ?? [];

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden content field synced from TipTap */}
      <input type="hidden" name="content" value={contentHtml} />

      {state?.error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ---- Main Column ---- */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Judul Artikel <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              placeholder="Masukkan judul artikel..."
              defaultValue={article?.title}
              required
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Ringkasan <span className="text-red-500">*</span>
            </label>
            <textarea
              name="excerpt"
              placeholder="Ringkasan singkat artikel (tampil di daftar)..."
              defaultValue={article?.excerpt}
              required
              rows={3}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Rich Text Editor */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Konten <span className="text-red-500">*</span>
            </label>
            <div className="border rounded-lg bg-background overflow-hidden min-h-[360px]">
              {editor && (
                <>
                  <EditorToolbar editor={editor} />
                  <EditorContent editor={editor} />
                </>
              )}
            </div>
          </div>
        </div>

        {/* ---- Sidebar Column ---- */}
        <div className="space-y-5">
          {/* Category */}
          <div className="rounded-xl border bg-card p-4">
            <label className="block text-sm font-medium mb-2">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              defaultValue={article?.category ?? "UMUM"}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background"
            >
              <option value="UMUM">Umum</option>
              <option value="ENERGI">Energi</option>
              <option value="NON_ENERGI">Non-Energi</option>
            </select>
          </div>

          {/* Cover Image — uploads directly to /api/upload, stores URL only */}
          <div className="rounded-xl border bg-card p-4">
            <label className="block text-sm font-medium mb-2">
              Gambar Cover
            </label>
            {coverPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverPreview}
                alt="Preview"
                className="w-full h-36 object-cover rounded-lg mb-3 bg-muted"
              />
            )}
            {/* Only send the URL to the Server Action — no raw file bytes */}
            <input type="hidden" name="coverImage" value={coverUrl} />
            <div className="flex gap-2 flex-col">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  // Immediate local preview
                  setCoverPreview(URL.createObjectURL(file));
                  setUploadError(null);
                  setIsUploading(true);

                  try {
                    const fd = new FormData();
                    fd.append("file", file);
                    fd.append("folder", "patra/articles");
                    const res = await fetch("/api/upload", {
                      method: "POST",
                      body: fd,
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    setCoverUrl(data.url);
                  } catch (err) {
                    setUploadError(
                      err instanceof Error ? err.message : "Upload gagal.",
                    );
                    setCoverPreview("");
                    setCoverUrl("");
                  } finally {
                    setIsUploading(false);
                  }
                }}
              />
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-3 py-2 text-sm border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <span className="size-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Mengunggah...
                  </>
                ) : coverPreview ? (
                  "Ganti Gambar"
                ) : (
                  "Upload Gambar"
                )}
              </button>
              {uploadError && (
                <p className="text-xs text-red-500">{uploadError}</p>
              )}
              {coverPreview && !isUploading && (
                <button
                  type="button"
                  onClick={() => {
                    setCoverPreview("");
                    setCoverUrl("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="w-full px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Hapus Gambar
                </button>
              )}
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="rounded-xl border bg-card p-4">
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                {tags.map((tag) => (
                  <label
                    key={tag.id}
                    className="flex items-center gap-2 text-sm cursor-pointer hover:text-foreground text-muted-foreground"
                  >
                    <input
                      type="checkbox"
                      name="tagIds"
                      value={tag.id}
                      defaultChecked={selectedTagIds.includes(tag.id)}
                      className="rounded"
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* SEO */}
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm font-medium mb-3">SEO (Opsional)</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Meta Title (maks. 60 karakter)
                </label>
                <input
                  name="metaTitle"
                  defaultValue={article?.metaTitle ?? ""}
                  maxLength={60}
                  className="w-full px-2 py-1.5 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Meta Description (maks. 160 karakter)
                </label>
                <textarea
                  name="metaDescription"
                  defaultValue={article?.metaDescription ?? ""}
                  maxLength={160}
                  rows={2}
                  className="w-full px-2 py-1.5 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Keywords (pisahkan dengan koma)
                </label>
                <input
                  name="keywords"
                  defaultValue={article?.keywords?.join(", ") ?? ""}
                  placeholder="migas, energi, perminyakan"
                  className="w-full px-2 py-1.5 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2 border-t">
        <button
          type="submit"
          name="action"
          value="draft"
          disabled={isPending || isUploading}
          className="px-5 py-2 text-sm font-medium border rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
        >
          {isPending ? "Menyimpan..." : "Simpan Draft"}
        </button>
        <button
          type="submit"
          name="action"
          value="publish"
          disabled={isPending || isUploading}
          className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? "Memproses..." : "Terbitkan"}
        </button>
        {isUploading && (
          <p className="text-xs text-muted-foreground">
            Tunggu gambar selesai diunggah...
          </p>
        )}
      </div>
    </form>
  );
}
