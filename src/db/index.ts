import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getEnv } from "@/config/env";
import * as schema from "./schema";

let db: ReturnType<typeof drizzle<typeof schema>> | undefined;

/** Lazily created Drizzle client. */
export function getDb() {
  db ??= drizzle(postgres(getEnv().DATABASE_URL), { schema });
  return db;
}
