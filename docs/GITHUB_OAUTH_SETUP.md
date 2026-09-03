# GitHub OAuth App 설정 가이드

myToDo는 GitHub OAuth를 통해 로그인합니다. 로컬 개발 환경에서 동작시키려면 아래 절차대로 GitHub OAuth App을 만들고 `.env`에 자격 증명을 채워야 합니다.

## 1. GitHub OAuth App 생성

1. GitHub에 로그인한 상태로 https://github.com/settings/developers 접속
2. **OAuth Apps** 탭 -> **New OAuth App** 클릭
3. 아래 값을 입력
   - **Application name**: `myToDo (local)` 등 원하는 이름
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/auth/github/callback`
     - 이 값은 반드시 애플리케이션이 사용하는 콜백 라우터(`/auth/github/callback`)와 정확히 일치해야 합니다.
4. **Register application** 클릭
5. 생성된 앱 페이지에서 **Client ID**를 복사
6. **Generate a new client secret**을 클릭해 **Client Secret**을 생성하고 복사 (다시 볼 수 없으니 즉시 저장)

## 2. 환경 변수 설정

저장소 루트의 `.env.example`을 복사해 `.env`를 만들고 값을 채웁니다.

```bash
cp .env.example .env
```

```bash
# .env
MONGODB_URI="mongodb+srv://..."
GITHUB_CLIENT_ID="1번에서 복사한 Client ID"
GITHUB_CLIENT_SECRET="1번에서 복사한 Client Secret"
```

`.env`는 `.gitignore`에 의해 커밋되지 않습니다. Client Secret을 코드에 직접 작성하지 마세요 — 반드시 `process.env.GITHUB_CLIENT_SECRET`을 통해서만 읽어야 합니다.

## 3. 실행 및 확인

```bash
npm run dev
```

1. http://localhost:3000 접속 시 로그인하지 않은 상태라면 `/login`으로 리다이렉트됩니다.
2. `/login`에서 "GitHub로 로그인" 버튼 클릭 -> GitHub 인가 화면 -> 승인하면 앱으로 리다이렉트되며 로그인 완료
3. 사이드바에 GitHub username/avatar와 로그아웃 링크가 표시됩니다.
4. 로그아웃 시 세션이 서버(DB)와 브라우저 쿠키 양쪽에서 삭제됩니다.

## 4. 배포 시 참고

운영 환경에 배포한다면 별도의 GitHub OAuth App을 하나 더 만들고 Authorization callback URL을 운영 도메인(`https://your-domain.com/auth/github/callback`)으로 설정하세요. 로컬용 앱과 운영용 앱은 분리하는 것을 권장합니다.
