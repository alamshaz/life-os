import { collectionHandlers } from "@/lib/crud";
import Goal from "@/models/Goal";

export const { GET, POST } = collectionHandlers(Goal, { defaultSort: "-createdAt" });
