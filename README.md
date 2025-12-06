# 하남시 전월세 자동 리포트 생성 서비스

Next.js 13+ App Router와 Supabase를 활용한 전월세 실거래가 자동 리포트 생성 서비스입니다.

## 🚀 주요 기능

- **Excel 업로드**: 국토교통부 실거래가 Excel 파일 자동 파싱
- **데이터 저장**: Supabase PostgreSQL에 거래 데이터 저장
- **리포트 생성**: 주차별 통계 및 거래 내역 자동 생성
- **티스토리 연동**: 블로그 텍스트 + HTML 테이블 원클릭 복사

## 📋 시작하기

### 1. 환경 변수 설정

`.env.local` 파일을 생성하고 Supabase 정보를 입력하세요:

```env
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 2. Supabase 테이블 생성

Supabase SQL Editor에서 다음 쿼리를 실행하세요:

```sql
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

-- 인덱스 생성
create index idx_deals_period_key on public.deals(period_key);
create index idx_deals_contract_date on public.deals(contract_date);
```

### 3. 패키지 설치 및 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 열어주세요.

## 📖 사용 방법

### 1단계: Excel 업로드

1. [국토교통부 실거래가 공개시스템](https://rt.molit.go.kr/)에서 하남시 전월세 데이터를 Excel로 다운로드
2. `/upload` 페이지에서 Excel 파일 업로드
3. 자동으로 파싱되어 Supabase에 저장됨

### 2단계: 리포트 생성

1. `/report` 페이지 접속
2. 기간 키 입력 (예: `2025-11-W1` - 2025년 11월 1주차)
3. "리포트 생성" 버튼 클릭
4. 생성된 텍스트와 HTML 테이블을 "복사하기" 버튼으로 복사
5. 티스토리 블로그에 붙여넣기

## 🏗️ 프로젝트 구조

```
/app
  /upload           # Excel 업로드 페이지
  /report           # 리포트 생성 페이지
  /api
    /upload         # Excel 파싱 및 DB 저장 API
    /report         # 리포트 생성 API

/lib
  supabaseServer.ts # Supabase 서버 클라이언트
  parseExcel.ts     # Excel 파싱 로직
  buildReport.ts    # 리포트 데이터 생성
  renderPost.ts     # 블로그 텍스트 생성
  renderTables.ts   # HTML 테이블 생성
  types.ts          # TypeScript 타입 정의
```

## 🎨 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Libraries**: xlsx, @supabase/supabase-js

## 📊 데이터 구조

### period_key 형식
- `YYYY-MM-WN` (N은 주차)
- 예: `2025-11-W1`, `2025-12-W4`

### 주차 계산
- 1~7일: W1
- 8~14일: W2
- 15~21일: W3
- 22일~: W4

## 🔧 확장 아이디어

- [ ] 다중 시군구 지원 (성남시, 용인시 등)
- [ ] 자동 크론 업데이트
- [ ] 차트 및 그래프 자동 생성
- [ ] 말투 스타일 선택 기능
- [ ] PDF 리포트 생성

## 📝 라이선스

MIT License

## 🙏 참고

이 프로젝트는 `vercel_supabase_rental_report_guide.md` 문서를 바탕으로 구축되었습니다.
