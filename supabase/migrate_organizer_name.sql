-- Если таблица events уже создана без organizer_name:
alter table public.events add column if not exists organizer_name text not null default '';

update public.events set organizer_name = location where organizer_name = '';
