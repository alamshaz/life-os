import { collectionHandlers } from "@/lib/crud";
import Task from "@/models/Task";

export const { GET, POST } = collectionHandlers(Task, { defaultSort: "completed dueDate" });
