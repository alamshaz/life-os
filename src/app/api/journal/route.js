import { collectionHandlers } from "@/lib/crud";
import JournalEntry from "@/models/JournalEntry";

export const { GET, POST } = collectionHandlers(JournalEntry, { defaultSort: "-date" });
