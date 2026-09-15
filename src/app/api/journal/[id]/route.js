import { itemHandlers } from "@/lib/crud";
import JournalEntry from "@/models/JournalEntry";

export const { PATCH, DELETE } = itemHandlers(JournalEntry);
