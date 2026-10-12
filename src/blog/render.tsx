/**
 * Server-side entry for the static blog (built with `vite build --ssr`, then
 * called by scripts/build-blog.mjs). Returns the <body> markup of each page.
 *
 * The header is rendered with renderToString into #header-root so the browser
 * can hydrate it (mobile menu, scroll state); everything else is plain static
 * markup. #islands-root is where the client mounts the quote modal and the
 * mobile action bar.
 */
import type { ReactElement } from 'react'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { BlogIndexPage, BlogPostPage } from './pages'
import type { Post, PostSummary } from './posts'

function body(main: ReactElement) {
  return [
    `<div id="header-root">${renderToString(<Header />)}</div>`,
    `<main>${renderToStaticMarkup(main)}</main>`,
    renderToStaticMarkup(<Footer />),
    '<div id="islands-root"></div>',
  ].join('\n')
}

export function renderIndex(posts: PostSummary[]) {
  return body(<BlogIndexPage posts={posts} />)
}

export function renderPost(post: Post, related: PostSummary[]) {
  return body(<BlogPostPage post={post} related={related} />)
}
