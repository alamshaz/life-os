import { itemHandlers } from "@/lib/crud";
import Goal from "@/models/Goal";

export const { PATCH, DELETE } = itemHandlers(Goal);
