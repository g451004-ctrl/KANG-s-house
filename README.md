# 💰 우리집 용돈 앱

React + Supabase + Vercel 웹앱. 자녀가 매일/주 N회 할 일을 스스로 체크하면 부모가 인증하고, 매주 정산되는 용돈을 관리합니다.

---

## 🚀 배포 가이드

### 1단계 — Supabase 설정 (DB + API)

1. [supabase.com](https://supabase.com) 접속 → 무료 계정 가입
2. **New project** 클릭 → 프로젝트 이름 입력 (예: `allowance`) → DB 비밀번호 설정 → **Create**
3. 프로젝트 생성 완료 후 **SQL Editor** 탭 클릭
4. `supabase_schema.sql` 파일 내용 전체 복사 → 붙여넣기 → **Run** 클릭
5. **Settings > API** 에서 다음 두 값을 복사해 둡니다:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

---

### 2단계 — 부모 비밀번호 설정

원하는 비밀번호를 SHA-256으로 해시 변환합니다.

```
https://emn178.github.io/online-tools/sha256.html
```

---

### 3단계 — Vercel 배포

1. 이 프로젝트를 GitHub에 업로드
   ```bash
   git init
   git add .
   git commit -m "initial"
   git remote add origin https://github.com/아이디/allowance-app.git
   git push -u origin main
   ```

2. [vercel.com](https://vercel.com) → **New Project** → GitHub 연결 → 저장소 선택

3. **Environment Variables** 에 다음 3개 추가:
   ```
   VITE_SUPABASE_URL       = https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY  = eyJhbG...
   VITE_ADMIN_PASSWORD_HASH = (2단계에서 복사한 해시값)
   ```

4. **Deploy** 클릭 → 완료!

---

## 📱 사용법

### 처음 시작할 때
1. 🔒 부모 모드로 들어가서 (기본 비밀번호 `admin1234`, 배포 후엔 설정한 비밀번호) **항목관리** 탭에서 자녀 2명을 이름 + 4자리 PIN으로 등록합니다.
2. 같은 화면에서 자녀별로 용돈 항목을 추가합니다. 항목마다 금액과 "주당 필요 횟수(1~7회)"를 정합니다.
   - 7회 = 매일 해야 받는 용돈
   - 1회 = 한 번만 해도 받는 역할 수당
   - 3~6회 = 주 N회 이상 해야 받는 용돈

### 아이
- 첫 화면에서 자기 아바타를 누르고 PIN을 입력하면 자기 화면으로 들어갑니다.
- 오늘/지난 날짜 칸을 눌러 "했어요" 체크를 합니다 (부모 인증 전까지는 취소도 가능).
- 부모님이 인증하면 ✓ 표시로 바뀌고, 목표 횟수를 채우면 그 주의 용돈이 확정됩니다.

### 부모
- **현황**: 두 아이의 이번 주 진행 상황을 한 화면에서 보고, 아이가 체크한 항목을 승인합니다.
- **항목관리**: 자녀 등록/PIN 변경, 용돈 항목 추가·수정·삭제·비활성화.
- **정산내역**: 지난 8주간 주차별로 달성한 항목과 합계 금액을 확인합니다.

> 정산은 별도 배치 작업 없이, 항상 실시간으로 그 주의 체크 기록을 집계해서 보여줍니다. 일요일이 지나면 자동으로 지난 주로 넘어갑니다.

---

## 🛠 로컬 개발

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일에 Supabase URL, Key, 비밀번호 해시 입력

# 개발 서버 실행
npm run dev
```

> 💡 `.env` 파일 없이 실행 시 비밀번호 `admin1234` 로 부모 모드 로그인 가능 (개발 환경 전용). Supabase 연결 없이는 데이터가 저장되지 않습니다.

---

## 📁 프로젝트 구조

```
src/
  components/
    ChildSelect.jsx       # 첫 화면 (자녀 선택 + 부모 모드 버튼)
    ChildPinPad.jsx        # 자녀 PIN 입력
    ParentLogin.jsx        # 부모 비밀번호 입력
    WeekProgressCard.jsx   # 항목별 한 주 체크 현황 카드 (공용)
  pages/
    ChildHome.jsx          # 자녀 화면
    ParentDashboard.jsx    # 부모 현황 (두 아이 동시 + 인증)
    ParentTasks.jsx        # 자녀/항목 관리
    ParentHistory.jsx      # 주차별 정산 내역
  hooks/
    useAdminAuth.js         # 부모 인증 (SHA-256 + sessionStorage)
    useChildAuth.js          # 자녀 PIN 인증
    useChildren.js           # children CRUD + realtime
    useTasks.js               # tasks CRUD + realtime
    useCheckins.js            # 체크/인증 + 주간 집계
  lib/
    supabase.js             # Supabase 클라이언트
    dateUtils.js             # 주 계산(월~일) 유틸
  App.jsx                  # 메인 라우팅
  index.css                # 전역 스타일
supabase_schema.sql        # DB 스키마
```
