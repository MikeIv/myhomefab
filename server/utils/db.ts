import mysql from "mysql2/promise";
import type { Pool, PoolConnection } from "mysql2/promise";

let pool: Pool | null = null;

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  waitForConnections?: boolean;
  connectionLimit?: number;
  queueLimit?: number;
}

export function getDatabasePool(): Pool {
  if (pool) {
    return pool;
  }

  const config = useRuntimeConfig();

  const dbConfig: DatabaseConfig = {
    host: config.dbHost,
    port: config.dbPort,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbDatabase,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };

  pool = mysql.createPool(dbConfig);

  return pool;
}

export async function getConnection(): Promise<PoolConnection> {
  const pool = getDatabasePool();
  return pool.getConnection();
}

export async function query<T = unknown>(
  sql: string,
  params?: unknown[],
): Promise<T[]> {
  const pool = getDatabasePool();
  const [rows] = await pool.execute<T[]>(sql, params);
  return rows;
}

export async function queryOne<T = unknown>(
  sql: string,
  params?: unknown[],
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
