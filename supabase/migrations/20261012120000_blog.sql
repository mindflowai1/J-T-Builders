-- Blog: posts, the admins allowed to write them, and the image bucket.
--
-- Security model: the public site is static HTML generated at build time with
-- the anon key, so anon only ever needs to READ published posts. Every write
-- comes from the /admin/ page as an authenticated user, and RLS lets it through
-- only when that user is listed in public.admins. Signing up gets a stranger
-- nothing.

-- ---------------------------------------------------------------------------
-- Admins
-- ---------------------------------------------------------------------------
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- An admin can see their own row (the publish endpoint checks it this way).
-- Nobody manages this table through the API: rows are added with SQL.
create policy "admins_select_own"
  on public.admins for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Helper for policies. Lives in a schema the Data API does not expose, so it
-- can't be called as an RPC. security definer lets it read public.admins
-- regardless of that table's RLS; it only ever answers for the caller.
create schema if not exists private;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

revoke execute on function private.is_admin() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- Posts
-- ---------------------------------------------------------------------------
create table public.posts (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique
                  check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  title           text not null check (char_length(title) between 1 and 200),
  excerpt         text not null default '' check (char_length(excerpt) <= 400),
  body            text not null default '',
  cover_url       text,
  cover_alt       text not null default '',
  seo_title       text check (char_length(seo_title) <= 120),
  seo_description text check (char_length(seo_description) <= 320),
  author_name     text not null check (char_length(author_name) between 1 and 120),
  tags            text[] not null default '{}',
  status          text not null default 'draft' check (status in ('draft', 'published')),
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- A published post always has a date (sitemap, JSON-LD, ordering)
  constraint posts_published_has_date
    check (status = 'draft' or published_at is not null),
  -- A cover image always has alt text (accessibility + image SEO)
  constraint posts_cover_has_alt
    check (cover_url is null or char_length(cover_alt) > 0)
);

-- The one public query: published posts, newest first
create index posts_published_idx
  on public.posts (published_at desc)
  where status = 'published';

-- updated_at maintenance, and the slug lock: once a post has been published its
-- URL may already be indexed or shared, so changing the slug would break it.
create or replace function private.posts_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.published_at is not null and new.slug <> old.slug then
    raise exception 'The slug of a published post cannot be changed'
      using errcode = 'check_violation';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger posts_before_update
  before update on public.posts
  for each row execute function private.posts_before_update();

alter table public.posts enable row level security;

create policy "posts_select_published"
  on public.posts for select
  to anon, authenticated
  using (status = 'published');

create policy "posts_select_admin"
  on public.posts for select
  to authenticated
  using ((select private.is_admin()));

create policy "posts_insert_admin"
  on public.posts for insert
  to authenticated
  with check ((select private.is_admin()));

create policy "posts_update_admin"
  on public.posts for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "posts_delete_admin"
  on public.posts for delete
  to authenticated
  using ((select private.is_admin()));

-- ---------------------------------------------------------------------------
-- Images
-- ---------------------------------------------------------------------------
-- Public bucket: post pages link straight to the object URLs. Writes are
-- admin-only; the admin UI converts uploads to WebP before sending them.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-images',
  'blog-images',
  true,
  5242880,
  array['image/webp', 'image/jpeg', 'image/png']
);

create policy "blog_images_insert_admin"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'blog-images' and (select private.is_admin()));

create policy "blog_images_update_admin"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'blog-images' and (select private.is_admin()));

create policy "blog_images_delete_admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'blog-images' and (select private.is_admin()));
