-- region_codes 테이블 생성
create table if not exists public.region_codes (
  code text primary key,
  city text not null,
  region text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS 정책 설정 (선택 사항: 익명 사용자도 읽을 수 있게 하려면)
alter table public.region_codes enable row level security;

create policy "Enable read access for all users" on public.region_codes
  for select using (true);

create policy "Enable insert access for all users" on public.region_codes
  for insert with check (true);

create policy "Enable delete access for all users" on public.region_codes
  for delete using (true);

-- 초기 데이터 예시 (경기도 하남시)
insert into public.region_codes (code, city, region)
values ('41450', '경기도', '하남시')
on conflict (code) do nothing;
