import { collectionHandlers } from "@/lib/crud";
import FocusSession from "@/models/FocusSession";

export const { GET, POST } = collectionHandlers(FocusSession, { defaultSort: "-startedAt" });
