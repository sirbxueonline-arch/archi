import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Supabase Supavisor pooler (port 6543) requires SSL
const pgOptions: postgres.Options<{}> = {
  prepare: false,
  ssl: { rejectUnauthorized: false },
};

// Prevent multiple connections in development
declare global {
  // eslint-disable-next-line no-var
  var _pgClient: postgres.Sql | undefined;
}

let client: postgres.Sql;

if (process.env.NODE_ENV === "production") {
  client = postgres(connectionString, pgOptions);
} else {
  if (!global._pgClient) {
    global._pgClient = postgres(connectionString, pgOptions);
  }
  client = global._pgClient;
}

export const db = drizzle(client, { schema });
export type DB = typeof db;
