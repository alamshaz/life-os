import { collectionHandlers } from "@/lib/crud";
import Expense from "@/models/Expense";

export const { GET, POST } = collectionHandlers(Expense, { defaultSort: "-date" });
