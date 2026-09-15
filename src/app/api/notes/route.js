import { collectionHandlers } from "@/lib/crud";
import Note from "@/models/Note";

export const { GET, POST } = collectionHandlers(Note, { defaultSort: "-pinned -updatedAt" });
