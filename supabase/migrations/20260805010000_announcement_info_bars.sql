-- 既存のお知らせを、LMS全体に表示するインフォバーとしても利用できるようにする。
alter table public.announcements
  add column if not exists show_in_info_bar boolean not null default false,
  add column if not exists info_bar_variant text not null default 'info',
  add column if not exists info_bar_ends_at timestamptz,
  add column if not exists info_bar_dismissible boolean not null default true;

alter table public.announcements
  drop constraint if exists announcements_info_bar_variant_check;
alter table public.announcements
  add constraint announcements_info_bar_variant_check
  check (info_bar_variant in ('info', 'warning', 'incident', 'resolved'));

create index if not exists announcements_active_info_bar_idx
  on public.announcements (show_in_info_bar, is_published, published_at desc, info_bar_ends_at);

-- 管理者権限とは分離し、事務担当者にはお知らせ管理だけを個別付与できるようにする。
alter table public.support_agents
  add column if not exists can_manage_announcements boolean not null default false;
