import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";

import * as schema from "@/db/schema";

const expoDb = openDatabaseSync("digest.db");

expoDb.execSync("PRAGMA journal_mode = WAL");

export const db = drizzle(expoDb, { schema });
