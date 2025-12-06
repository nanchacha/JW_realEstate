# Supabase 설정 가이드

## 1️⃣ Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 접속하여 로그인
2. "New Project" 버튼 클릭
3. 프로젝트 이름, 비밀번호, 리전 선택
4. 프로젝트 생성 대기 (약 2분 소요)

## 2️⃣ 데이터베이스 테이블 생성

1. Supabase 대시보드에서 **SQL Editor** 클릭
2. "New Query" 버튼 클릭
3. 아래 SQL 코드를 복사하여 붙여넣기
4. "Run" 버튼 클릭

```sql
-- deals 테이블 생성
create table public.deals (
  id                bigserial primary key,
  city              text not null default '하남시',
  region            text not null default '경기도 하남시',
  
  dong              text not null,
  complex           text not null,
  lease_kind        text not null,         -- 'JEONSE' | 'WOLSE'
  contract_kind     text not null,         -- 'NEW' | 'RENEW'
  
  area_m2           numeric,
  area_type         integer,
  
  contract_date     date not null,
  period_key        text not null,
  
  deposit_manwon    numeric,
  deposit_uk        numeric,
  rent_manwon       numeric,
  
  floor             integer,
  period_text       text,
  contract_type_label text,
  
  renew_right_used  text,
  prev_deposit_manwon numeric,
  
  raw_row           jsonb,
  created_at        timestamptz default now()
);

-- 인덱스 생성 (쿼리 성능 향상)
create index idx_deals_period_key on public.deals(period_key);
create index idx_deals_contract_date on public.deals(contract_date);
create index idx_deals_dong on public.deals(dong);
create index idx_deals_complex on public.deals(complex);

-- Row Level Security (RLS) 비활성화 (서버에서만 접근)
alter table public.deals disable row level security;
```

## 3️⃣ API 키 확인

1. Supabase 대시보드에서 **Settings** > **API** 클릭
2. 다음 두 값을 복사:
   - **Project URL** (예: `https://xxxxxxxxxxxxx.supabase.co`)
   - **Service Role Key** (anon key가 아닌 service_role key!)
     - "Reveal" 버튼을 눌러 확인

## 4️⃣ 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음을 입력:

```env
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ **주의**: 
> - `.env.local` 파일은 Git에 커밋되지 않습니다.
> - `SUPABASE_SERVICE_ROLE_KEY`는 절대 외부에 노출하지 마세요!

## 5️⃣ 연결 테스트

1. 개발 서버 실행:
   ```bash
   npm run dev
   ```

2. 브라우저에서 `http://localhost:3000/upload` 접속

3. 테스트용 Excel 파일 업로드 (국토부 실거래가 파일)

4. 업로드 성공 메시지 확인

5. Supabase 대시보드 > **Table Editor** > **deals** 테이블에서 데이터 확인

## 6️⃣ Vercel 배포 시 환경 변수 설정

1. Vercel 대시보드에서 프로젝트 선택
2. **Settings** > **Environment Variables** 클릭
3. 다음 변수 추가:
   - `SUPABASE_URL`: Supabase Project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Service Role Key
4. Production, Preview, Development 모두 체크
5. "Save" 클릭

## 📊 테스트 데이터 샘플

테스트를 위해 수동으로 데이터를 추가하려면:

```sql
INSERT INTO public.deals (
  dong, complex, lease_kind, contract_kind,
  area_type, contract_date, period_key, period_text,
  deposit_uk, rent_manwon, floor, contract_type_label
) VALUES (
  '감일동', '감일신미주', 'JEONSE', 'NEW',
  34, '2025-11-05', '2025-11-W1', '2025년 11월 1주차',
  4.5, null, 5, '신규'
);
```

## 🔍 문제 해결

### 업로드가 안 될 때
- `.env.local` 파일이 제대로 설정되었는지 확인
- Supabase Project URL이 올바른지 확인
- Service Role Key (anon key가 아님!)인지 확인
- 서버 재시작 (`Ctrl+C` 후 `npm run dev`)

### 데이터가 보이지 않을 때
- Supabase Table Editor에서 deals 테이블에 데이터가 있는지 확인
- period_key가 정확한지 확인 (예: `2025-11-W1`)
- 브라우저 콘솔에서 에러 메시지 확인

## ✅ 완료!

이제 하남시 전월세 자동 리포트 생성 서비스를 사용할 수 있습니다! 🎉
