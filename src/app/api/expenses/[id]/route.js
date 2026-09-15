import { itemHandlers } from "@/lib/crud";
import Expense from "@/models/Expense";

export const { PATCH, DELETE } = itemHandlers(Expense);
