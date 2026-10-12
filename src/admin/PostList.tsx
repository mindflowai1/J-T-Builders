import { useEffect, useState } from 'react'
import { formatDate, postPath, type Post } from '../blog/posts'
import { supabase } from './supabase'

type Row = Pick<Post, 'id' | 'title' | 'slug' | 'status' | 'author_name' | 'published_at' | 'updated_at'>

const UPDATED = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export default function PostList() {
  const [posts, setPosts] = useState<Row[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase
      .from('posts')
      .select('id, title, slug, status, author_name, published_at, updated_at')
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setPosts(data as Row[])
      })
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Blog</p>
          <div className="accent-rule mt-2 mb-3" />
          <h1 className="font-display text-3xl font-bold text-ink-950 uppercase">All Posts</h1>
        </div>
        <a
          href="#/new"
          className="rounded-lg bg-brand-500 px-5 py-2.5 font-bold text-ink-950 transition-colors hover:bg-brand-400 active:bg-brand-600"
        >
          + New post
        </a>
      </div>

      {error && <p className="mt-6 font-semibold text-red-600">Could not load posts: {error}</p>}
      {!posts && !error && <p className="mt-10 text-ink-500">Loading…</p>}

      {posts && posts.length === 0 && (
        <div className="mt-10 rounded-2xl bg-white p-10 text-center shadow-lg ring-1 ring-ink-500/10">
          <p className="font-display text-xl font-bold text-ink-950 uppercase">No posts yet</p>
          <p className="mt-2 text-ink-500">Write the first one: it shows up on the blog and the home page.</p>
        </div>
      )}

      {posts && posts.length > 0 && (
        <ul className="mt-8 divide-y divide-ink-500/10 overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-ink-500/10">
          {posts.map((post) => (
            <li key={post.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4 sm:flex-nowrap">
              <a href={`#/edit/${post.id}`} className="group min-w-0 flex-1">
                <p className="truncate font-bold text-ink-950 group-hover:text-brand-600">{post.title}</p>
                <p className="mt-0.5 text-sm text-ink-500">
                  {post.author_name} · {post.status === 'published' ? formatDate(post.published_at) : `Edited ${UPDATED.format(new Date(post.updated_at))}`}
                </p>
              </a>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase ${
                  post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-ink-500/15 text-ink-700'
                }`}
              >
                {post.status === 'published' ? 'Published' : 'Draft'}
              </span>
              <div className="flex gap-4 text-sm font-bold">
                <a href={`#/edit/${post.id}`} className="text-ink-950 hover:text-brand-600">
                  Edit
                </a>
                {post.status === 'published' && (
                  <a href={postPath(post.slug)} target="_blank" rel="noreferrer" className="text-ink-500 hover:text-brand-600">
                    View ↗
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
