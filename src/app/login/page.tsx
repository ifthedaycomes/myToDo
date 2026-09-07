import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="card flex flex-col items-center gap-4 p-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-semibold text-primary-foreground">
          T
        </span>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">myToDo 로그인</h1>
          <p className="mt-1 text-sm text-muted">GitHub 계정으로 로그인하세요.</p>
        </div>
        <a href="/auth/github" className="btn-primary">
          GitHub로 로그인
        </a>
      </div>
    </div>
  );
}
