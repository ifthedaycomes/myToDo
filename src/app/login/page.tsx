import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4 rounded-lg border border-black/10 dark:border-white/10 p-8 text-center">
        <h1 className="text-lg font-semibold">myToDo 로그인</h1>
        <p className="text-sm text-neutral-500">GitHub 계정으로 로그인하세요.</p>
        <a
          href="/auth/github"
          className="inline-block rounded-md bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-sm"
        >
          GitHub로 로그인
        </a>
      </div>
    </div>
  );
}
