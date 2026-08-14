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
  per_completion boolean not null default false, -- true: 할 때마다 amount 지급(최대 weekly_target회), false: 목표 달성시 amount 1회 지급
  subitems text[], -- 설정시 요일 대신 이 목록을 체크리스트로 사용 (예: ['영어','수학'])
  active boolean not null default true,
  created_at timestamptz default now()
);

-- 일별 체크인 (아이 자가체크 + 부모 인증)
create table checkins (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  child_id uuid not null references children(id) on delete cascade,
  date date not null,
  item text not null default '', -- subitems 기반 항목일 때 체크리스트 항목명 (요일 기반이면 빈 문자열)
  checked_at timestamptz,
  verified boolean not null default false,
  verified_at timestamptz,
  unique (task_id, date, item)
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
