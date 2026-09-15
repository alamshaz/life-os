import { itemHandlers } from "@/lib/crud";
import Habit from "@/models/Habit";

export const { PATCH, DELETE } = itemHandlers(Habit);
