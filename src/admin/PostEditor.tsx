import { useEffect, useMemo, useState, type ReactNode } from 'react'
import PostArticle from '../blog/PostArticle'
import PostCard from '../blog/PostCard'
import { formatDate, readingMinutes, slugify, type Post } from '../blog/posts'
import { pickImage, uploadImage } from './images'
import { triggerRebuild } from './publish'
import RichTextEditor from './RichTextEditor'
import { supabase } from './supabase'

type Form = {
  title: string
  slug: string
  author_name: string
  excerpt: string
  body: string
  cover_url: string | null
  cover_alt: string
  tags: string
  seo_title: string
  seo_description: string
}

const EMPTY: Form = {
  title: '',
  slug: '',
  author_name: '',
  excerpt: '',
  body: '',
  cover_url: null,
  cover_alt: '',
  tags: '',
  seo_title: '',
  seo_description: '',
}

// What Google shows before truncating; the database allows more
const SEO_TITLE_TARGET = 60
const SEO_DESCRIPTION_TARGET = 160

type Notice = { tone: 'success' | 'error' | 'info'; text: string }

function toForm(post: Post): Form {
  return {
    title: post.title,
    slug: post.slug,
    author_name: post.author_name,
    excerpt: post.excerpt,
    body: post.body,
    cover_url: post.cover_url,
    cover_alt: post.cover_alt,
    tags: post.tags.join(', '),
    seo_title: post.seo_title ?? '',
    seo_description: post.seo_description ?? '',
  }
}

const plainText = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

/** Turns database errors into something the author can act on. */
function explain(error: { code?: string; message: string }) {
  if (error.code === '23505') return 'Another post already uses this URL. Change the slug.'
  if (error.message.includes('slug of a published post'))
    return 'This post has been published, so its URL is locked to keep existing links working.'
  if (error.code === '42501') return 'Your account is not allowed to make this change.'
  return error.message
}

export default function PostEditor({ postId }: { postId: string | null }) {
  const [post, setPost] = useState<Post | null>(null)
  const [form, setForm] = useState<Form>(EMPTY)
  const [saved, setSaved] = useState<Form>(EMPTY)
  const [loading, setLoading] = useState(postId !== null)
  const [busy, setBusy] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  // The slug follows the title until the author edits it by hand
  const [slugTouched, setSlugTouched] = useState(postId !== null)

  useEffect(() => {
    if (!postId) return
    let cancelled = false
    supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setNotice({ tone: 'error', text: `Could not load this post: ${error.message}` })
        } else {
          setPost(data as Post)
          setForm(toForm(data as Post))
          setSaved(toForm(data as Post))
        }
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [postId])

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved])
  const slugLocked = Boolean(post?.published_at)
  const isPublished = post?.status === 'published'

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  const update = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => {
      const next = { ...f, [key]: value }
      if (key === 'title' && !slugTouched && !slugLocked) next.slug = slugify(value as string)
      return next
    })

  const tags = form.tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  function validate(publishing: boolean): string | null {
    if (!form.title.trim()) return 'Add a title.'
    if (!form.author_name.trim()) return 'Add the author’s name.'
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(form.slug))
      return 'The URL slug can only use lowercase letters, numbers and single hyphens.'
    if (form.cover_url && !form.cover_alt.trim())
      return 'Describe the cover image (alt text) — it matters for search and accessibility.'
    if (publishing && !plainText(form.body)) return 'The article is empty.'
    return null
  }

  async function save(status: 'draft' | 'published') {
    const publishing = status === 'published'
    const problem = validate(publishing)
    if (problem) {
      setNotice({ tone: 'error', text: problem })
      return
    }
    setBusy(true)
    setNotice(null)

    const payload = {
      title: form.title.trim(),
      slug: form.slug,
      author_name: form.author_name.trim(),
      excerpt: form.excerpt.trim(),
      body: form.body,
      cover_url: form.cover_url,
      cover_alt: form.cover_url ? form.cover_alt.trim() : '',
      tags,
      seo_title: form.seo_title.trim() || null,
      seo_description: form.seo_description.trim() || null,
      status,
      // Keep the original date on later edits; a first publish stamps it
      published_at: publishing ? (post?.published_at ?? new Date().toISOString()) : (post?.published_at ?? null),
    }

    const { data, error } = post
      ? await supabase.from('posts').update(payload).eq('id', post.id).select().single()
      : await supabase.from('posts').insert(payload).select().single()

    if (error) {
      setBusy(false)
      setNotice({ tone: 'error', text: explain(error) })
      return
    }

    const savedPost = data as Post
    const wasPublished = isPublished
    setPost(savedPost)
    setForm(toForm(savedPost))
    setSaved(toForm(savedPost))
    if (!postId) window.history.replaceState(null, '', `#/edit/${savedPost.id}`)

    // The public site only changes when a published post changes
    if (publishing || wasPublished) {
      const rebuild = await triggerRebuild()
      setNotice({
        tone: rebuild.ok ? 'success' : 'info',
        text: publishing
          ? `Published. ${rebuild.message}`
          : `Moved back to draft. ${rebuild.message}`,
      })
    } else {
      setNotice({ tone: 'success', text: 'Draft saved. It is not visible on the site.' })
    }
    setBusy(false)
  }

  async function remove() {
    if (!post) return
    if (!window.confirm(`Delete “${post.title}” permanently? This cannot be undone.`)) return
    setBusy(true)
    const { error } = await supabase.from('posts').delete().eq('id', post.id)
    if (error) {
      setBusy(false)
      setNotice({ tone: 'error', text: explain(error) })
      return
    }
    if (post.status === 'published') await triggerRebuild()
    setSaved(form) // nothing left to lose
    window.location.hash = '#/'
  }

  async function chooseCover() {
    const file = await pickImage()
    if (!file) return
    setUploadingCover(true)
    setNotice(null)
    try {
      update('cover_url', await uploadImage(file))
    } catch (err) {
      setNotice({ tone: 'error', text: err instanceof Error ? err.message : 'Upload failed' })
    } finally {
      setUploadingCover(false)
    }
  }

  if (loading) return <p className="py-24 text-center text-ink-500">Loading…</p>

  const previewPost = {
    title: form.title,
    body: form.body,
    cover_url: form.cover_url,
    cover_alt: form.cover_alt,
    author_name: form.author_name,
    tags,
    published_at: post?.published_at ?? null,
  }
  const searchTitle = form.seo_title || form.title || 'Post title'
  const searchDescription =
    form.seo_description || form.excerpt || plainText(form.body).slice(0, SEO_DESCRIPTION_TARGET)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <a href="#/" className="text-sm font-bold text-ink-500 transition-colors hover:text-brand-600">
            ← All posts
          </a>
          <StatusPill status={post?.status ?? 'draft'} isNew={!post} />
          {dirty && <span className="text-xs font-semibold text-ink-500">Unsaved changes</span>}
        </div>
        <div className="flex rounded-lg bg-ink-500/10 p-1" role="tablist" aria-label="View">
          {(['edit', 'preview'] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`rounded-md px-4 py-1.5 text-sm font-bold capitalize transition-colors ${
                tab === t ? 'bg-white text-ink-950 shadow' : 'text-ink-500 hover:text-ink-950'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {notice && (
        <p
          role="status"
          className={`mt-5 rounded-lg px-4 py-3 text-sm font-semibold ${
            notice.tone === 'error'
              ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
              : notice.tone === 'success'
                ? 'bg-green-50 text-green-800 ring-1 ring-green-200'
                : 'bg-brand-500/10 text-ink-950 ring-1 ring-brand-500/30'
          }`}
        >
          {notice.text}
        </p>
      )}

      {tab === 'preview' ? (
        <div className="mt-6 space-y-10">
          <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-ink-500/15">
            <PostArticle post={previewPost} preview />
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <PanelTitle>Card on the blog and home page</PanelTitle>
              <div className="max-w-sm">
                <PostCard
                  post={{
                    slug: form.slug || 'preview',
                    title: form.title || 'Post title',
                    excerpt: form.excerpt,
                    cover_url: form.cover_url,
                    cover_alt: form.cover_alt,
                    author_name: form.author_name,
                    published_at: post?.published_at ?? new Date().toISOString(),
                    reading_minutes: readingMinutes(form.body),
                  }}
                />
              </div>
            </div>
            <div>
              <PanelTitle>Google search result</PanelTitle>
              <SearchSnippet slug={form.slug} title={searchTitle} description={searchDescription} />
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid items-start gap-8 lg:grid-cols-[1fr_340px]">
          {/* Main column */}
          <div className="space-y-5">
            <label className="block">
              <span className="sr-only">Title</span>
              <input
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="Post title"
                maxLength={200}
                className="w-full bg-transparent font-display text-3xl font-bold text-ink-950 uppercase placeholder:text-ink-500/40 focus:outline-none sm:text-4xl"
              />
            </label>

            <div className="flex flex-wrap items-center gap-x-1 gap-y-2 text-sm text-ink-500">
              <span>jtbuildersct.com/blog/</span>
              {slugLocked ? (
                <span className="font-semibold text-ink-950" title="Locked after publishing so existing links keep working">
                  {form.slug} 🔒
                </span>
              ) : (
                <input
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true)
                    update('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
                  }}
                  placeholder="post-url"
                  aria-label="URL slug"
                  className="min-w-0 flex-1 rounded-md border border-ink-500/25 bg-white px-2 py-1 font-semibold text-ink-950 focus:border-brand-500 focus:outline-none"
                />
              )}
              <span>/</span>
            </div>

            <RichTextEditor key={post?.id ?? 'new'} value={form.body} onChange={(html) => update('body', html)} />
            <p className="text-right text-xs text-ink-500">
              {plainText(form.body).split(' ').filter(Boolean).length} words · {readingMinutes(form.body)} min read
            </p>
          </div>

          {/* Side panels */}
          <aside className="space-y-5">
            <Panel title="Publish">
              <p className="text-sm text-ink-700">
                {isPublished ? (
                  <>
                    Live since <strong>{formatDate(post!.published_at)}</strong>.
                  </>
                ) : post?.published_at ? (
                  'Draft (was published before). Not visible on the site.'
                ) : (
                  'Draft. Not visible on the site until you publish.'
                )}
              </p>
              <div className="mt-4 grid gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => save('published')}
                  className="rounded-lg bg-brand-500 px-4 py-2.5 font-bold text-ink-950 transition-colors hover:bg-brand-400 active:bg-brand-600 disabled:opacity-50"
                >
                  {busy ? 'Saving…' : isPublished ? 'Update live post' : 'Publish'}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => save('draft')}
                  className="rounded-lg border-2 border-ink-500/25 px-4 py-2 font-bold text-ink-950 transition-colors hover:border-ink-950 disabled:opacity-50"
                >
                  {isPublished ? 'Unpublish (back to draft)' : 'Save draft'}
                </button>
                {post && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={remove}
                    className="mt-1 text-sm font-bold text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    Delete post
                  </button>
                )}
              </div>
            </Panel>

            <Panel title="Details">
              <Field label="Author" required>
                <input
                  value={form.author_name}
                  onChange={(e) => update('author_name', e.target.value)}
                  placeholder="Full name, as readers should see it"
                  maxLength={120}
                  className={INPUT}
                />
              </Field>
              <Field label="Tags" hint="Comma separated, e.g. Decks, Composite, Maintenance">
                <input
                  value={form.tags}
                  onChange={(e) => update('tags', e.target.value)}
                  className={INPUT}
                />
              </Field>
            </Panel>

            <Panel title="Cover image">
              {form.cover_url ? (
                <img
                  src={form.cover_url}
                  alt={form.cover_alt}
                  className="aspect-[16/10] w-full rounded-lg object-cover"
                />
              ) : (
                <p className="text-sm text-ink-500">
                  Shown at the top of the article, on cards and when the link is shared.
                </p>
              )}
              <div className="mt-3 flex gap-3">
                <button type="button" onClick={chooseCover} disabled={uploadingCover} className={SECONDARY}>
                  {uploadingCover ? 'Uploading…' : form.cover_url ? 'Replace' : 'Upload image'}
                </button>
                {form.cover_url && (
                  <button type="button" onClick={() => update('cover_url', null)} className="text-sm font-bold text-ink-500 hover:text-red-600">
                    Remove
                  </button>
                )}
              </div>
              {form.cover_url && (
                <Field label="Image description (alt text)" required hint="What the photo shows, in a sentence.">
                  <input
                    value={form.cover_alt}
                    onChange={(e) => update('cover_alt', e.target.value)}
                    placeholder="e.g. Composite deck with black aluminum railings at dusk"
                    className={INPUT}
                  />
                </Field>
              )}
            </Panel>

            <Panel title="Summary">
              <Field label="Excerpt" hint="One or two sentences for cards. Also used as the search description if the one below is empty.">
                <textarea
                  value={form.excerpt}
                  onChange={(e) => update('excerpt', e.target.value)}
                  rows={3}
                  maxLength={400}
                  className={`${INPUT} resize-y`}
                />
                <Counter value={form.excerpt.length} target={SEO_DESCRIPTION_TARGET} max={400} />
              </Field>
            </Panel>

            <Panel title="Search engines (optional)">
              <Field label="SEO title" hint="Defaults to the post title.">
                <input
                  value={form.seo_title}
                  onChange={(e) => update('seo_title', e.target.value)}
                  maxLength={120}
                  className={INPUT}
                />
                <Counter value={form.seo_title.length} target={SEO_TITLE_TARGET} max={120} />
              </Field>
              <Field label="SEO description" hint="Defaults to the excerpt.">
                <textarea
                  value={form.seo_description}
                  onChange={(e) => update('seo_description', e.target.value)}
                  rows={3}
                  maxLength={320}
                  className={`${INPUT} resize-y`}
                />
                <Counter value={form.seo_description.length} target={SEO_DESCRIPTION_TARGET} max={320} />
              </Field>
              <SearchSnippet slug={form.slug} title={searchTitle} description={searchDescription} />
            </Panel>
          </aside>
        </div>
      )}
    </div>
  )
}

const INPUT =
  'w-full rounded-lg border border-ink-500/25 bg-white px-3 py-2 text-ink-950 placeholder:text-ink-500/60 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30'
const SECONDARY =
  'rounded-lg border-2 border-ink-500/25 px-3 py-1.5 text-sm font-bold text-ink-950 transition-colors hover:border-ink-950 disabled:opacity-50'

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-ink-500/10">
      <PanelTitle>{title}</PanelTitle>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function PanelTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 font-display text-sm font-bold tracking-wide text-ink-950 uppercase">{children}</h2>
  )
}

function Field({
  label,
  hint,
  required = false,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-ink-950">
        {label}
        {required && <span className="text-brand-600"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-xs leading-relaxed text-ink-500">{hint}</span>}
    </label>
  )
}

/** Characters used vs. what Google displays */
function Counter({ value, target, max }: { value: number; target: number; max: number }) {
  return (
    <span
      className={`mt-1 block text-right text-xs font-semibold ${
        value > target ? 'text-brand-600' : 'text-ink-500'
      }`}
    >
      {value}/{target}
      {value > target && ` · Google may cut it off (max ${max})`}
    </span>
  )
}

function StatusPill({ status, isNew }: { status: Post['status']; isNew: boolean }) {
  const label = isNew ? 'New' : status === 'published' ? 'Published' : 'Draft'
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase ${
        status === 'published' && !isNew ? 'bg-green-100 text-green-800' : 'bg-ink-500/15 text-ink-700'
      }`}
    >
      {label}
    </span>
  )
}

/** Approximation of a Google result, to judge title and description length */
function SearchSnippet({ slug, title, description }: { slug: string; title: string; description: string }) {
  const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text)
  return (
    <div className="rounded-lg border border-ink-500/15 bg-white p-4 font-[Arial,sans-serif]">
      <p className="truncate text-xs text-[#202124]">
        jtbuildersct.com › blog › {slug || 'post-url'}
      </p>
      <p className="mt-1 text-lg leading-snug text-[#1a0dab]">{clip(`${title} | J&T Builders Blog`, 65)}</p>
      <p className="mt-1 text-sm leading-relaxed text-[#4d5156]">{clip(description || 'Add an excerpt or SEO description.', 160)}</p>
    </div>
  )
}
