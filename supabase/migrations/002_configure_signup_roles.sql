-- Keep public signup role assignment controlled in the database.
-- New users are always created as students via trigger.

alter table public.profiles
  alter column role set default 'student';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'student')
  on conflict (id) do update
    set email = excluded.email;

  return new;
end;
$$;

-- Backfill missing profiles for users created before the trigger.
insert into public.profiles (id, email, role)
select
  id,
  email,
  'student'
from auth.users
where not exists (
  select 1
  from public.profiles
  where profiles.id = auth.users.id
);
