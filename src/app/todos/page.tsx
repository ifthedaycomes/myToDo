import { requireUser } from "@/lib/auth";
import { TodosView } from "./TodosView";

export default async function TodosPage() {
  await requireUser();
  return <TodosView />;
}
