import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useState, type ReactNode } from 'react'
import { pickImage, uploadImage } from './images'

/**
 * Article body editor. The toolbar offers only what the public page styles
 * (src/index.css .prose-blog): subheadings, emphasis, links, lists, quotes and
 * images. The title is the page's h1, so the editor starts at h2.
 *
 * The editable area uses the same .prose-blog class as the live page, so what
 * the author sees while typing is what readers will see.
 */
export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (html: string) => void
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: 'https',
          HTMLAttributes: { rel: null, target: null },
        },
      }),
      Image,
      Placeholder.configure({
        placeholder: 'Start writing… Use "Heading" to break the article into sections.',
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose-blog min-h-[420px] px-5 py-6 focus:outline-none sm:px-8',
        'aria-label': 'Article body',
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? '' : editor.getHTML()),
  })

  return (
    <div className="overflow-hidden rounded-xl border border-ink-500/25 bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/30">
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  )
}

function Toolbar({ editor }: { editor: Editor }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  // Re-render the toolbar when the selection changes, so active states update
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      h2: editor.isActive('heading', { level: 2 }),
      h3: editor.isActive('heading', { level: 3 }),
      bold: editor.isActive('bold'),
      italic: editor.isActive('italic'),
      link: editor.isActive('link'),
      bullet: editor.isActive('bulletList'),
      ordered: editor.isActive('orderedList'),
      quote: editor.isActive('blockquote'),
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
    }),
  })

  const setLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Link address (leave empty to remove the link)', previous ?? 'https://')
    if (url === null) return
    if (url.trim() === '' || url.trim() === 'https://') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
  }

  const addImage = async () => {
    const file = await pickImage()
    if (!file) return
    const alt = window.prompt(
      'Describe the image for search engines and screen readers (e.g. "Composite deck with black aluminum railings")',
    )
    if (alt === null) return
    setError('')
    setUploading(true)
    try {
      const src = await uploadImage(file)
      editor.chain().focus().setImage({ src, alt: alt.trim() }).run()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="sticky top-0 z-10 border-b border-ink-500/15 bg-cream-50/95 backdrop-blur">
      <div className="flex flex-wrap items-center gap-1 p-2" role="toolbar" aria-label="Formatting">
        <ToolButton
          label="Heading"
          active={state.h2}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolButton>
        <ToolButton
          label="Subheading"
          active={state.h3}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </ToolButton>
        <Divider />
        <ToolButton label="Bold" active={state.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
          <span className="font-black">B</span>
        </ToolButton>
        <ToolButton label="Italic" active={state.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <span className="font-serif italic">I</span>
        </ToolButton>
        <ToolButton label="Link" active={state.link} onClick={setLink}>
          Link
        </ToolButton>
        <Divider />
        <ToolButton
          label="Bulleted list"
          active={state.bullet}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </ToolButton>
        <ToolButton
          label="Numbered list"
          active={state.ordered}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </ToolButton>
        <ToolButton label="Quote" active={state.quote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          “ Quote
        </ToolButton>
        <ToolButton label="Insert image" onClick={addImage} disabled={uploading}>
          {uploading ? 'Uploading…' : 'Image'}
        </ToolButton>
        <Divider />
        <ToolButton label="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!state.canUndo}>
          ↶
        </ToolButton>
        <ToolButton label="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!state.canRedo}>
          ↷
        </ToolButton>
      </div>
      {error && <p className="px-3 pb-2 text-sm font-semibold text-red-600">{error}</p>}
    </div>
  )
}

function ToolButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // Keep the editor's selection while clicking the toolbar
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`min-w-9 rounded-md px-2.5 py-1.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? 'bg-ink-950 text-cream-50' : 'text-ink-700 hover:bg-ink-500/10'
      }`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <span className="mx-1 h-6 w-px bg-ink-500/20" aria-hidden="true" />
}
