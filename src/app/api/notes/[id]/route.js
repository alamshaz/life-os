import { itemHandlers } from "@/lib/crud";
import Note from "@/models/Note";

export const { PATCH, DELETE } = itemHandlers(Note);
