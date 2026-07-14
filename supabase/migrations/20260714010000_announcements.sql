create table public.announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null check (char_length(title) between 1 and 120),
  body text not null check (char_length(body) between 1 and 10000),
  audience text not null default 'all' check (audience in ('all', 'course', 'salon')),
  is_important boolean not null default false,
  is_published boolean not null default false,
  published_at timestamp with time zone not null default timezone('utc'::text, now()),
  created_by uuid references public.users(id) on delete set null,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);

create table public.announcement_reads (
  announcement_id uuid references public.announcements(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  read_at timestamp with time zone not null default timezone('utc'::text, now()),
  primary key (announcement_id, user_id)
);

create index announcements_publication_idx
  on public.announcements (is_published, published_at desc);
create index announcement_reads_user_idx
  on public.announcement_reads (user_id, read_at desc);

alter table public.announcements enable row level security;
alter table public.announcement_reads enable row level security;

create policy "Authenticated users can view visible announcements"
  on public.announcements for select
  using (
    auth.role() = 'authenticated'
    and is_published = true
    and published_at <= now()
    and (
      audience = 'all'
      or (
        audience = 'course'
        and exists (
          select 1 from public.users
          where users.id = auth.uid()
            and users.role in ('user', 'owner', 'admin')
        )
      )
      or (
        audience = 'salon'
        and exists (
          select 1 from public.users
          where users.id = auth.uid()
            and users.role in ('salon_member', 'owner', 'admin')
        )
      )
    )
  );

create policy "Users can view their own announcement reads"
  on public.announcement_reads for select
  using (auth.uid() = user_id);

create policy "Users can insert their own announcement reads"
  on public.announcement_reads for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own announcement reads"
  on public.announcement_reads for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
