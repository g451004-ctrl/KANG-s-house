-- 자녀
create table children (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pin char(4) not null,
  color text not null default '#6366f1',
  created_at timestamptz default now()
);

-- 용돈 항목 (역할). 한 항목은 특정 자녀 1명에게 귀속.
create table tasks (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  name text not null,
  description text,
  amount integer not null,
  weekly_target smallint not null check (weekly_target between 1 and 7),
  active boolean not null default true,
  created_at timestamptz default now()
);

-- 일별 체크인 (아이 자가체크 + 부모 인증)
create table checkins (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  child_id uuid not null references children(id) on delete cascade,
  date date not null,
  checked_at timestamptz,
  verified boolean not null default false,
  verified_at timestamptz,
  unique (task_id, date)
);

create index checkins_child_date_idx on checkins(child_id, date);

alter table children enable row level security;
alter table tasks enable row level security;
alter table checkins enable row level security;

create policy "allow all" on children for all using (true) with check (true);
create policy "allow all" on tasks for all using (true) with check (true);
create policy "allow all" on checkins for all using (true) with check (true);

-- realtime 구독을 위해 publication에 추가
alter publication supabase_realtime add table children;
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table checkins;
