-- Выполните в Supabase SQL Editor, если таблица events уже создана со старым CHECK по английским типам.
alter table public.events drop constraint if exists events_type_check;
alter table public.events
  add constraint events_type_check
  check (type in ('Конференция', 'Мастер-класс', 'Встреча', 'Conference', 'Workshop', 'Meetup'));
