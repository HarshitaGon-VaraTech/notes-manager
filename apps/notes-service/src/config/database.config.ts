const toNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const notesWriteDatabaseConfig = {
  host: process.env.NOTES_WRITE_DB_HOST ?? 'localhost',
  port: toNumber(process.env.NOTES_WRITE_DB_PORT, 5433),
  username: process.env.NOTES_WRITE_DB_USER ?? 'postgres',
  password: process.env.NOTES_WRITE_DB_PASSWORD ?? 'postgres',
  database: process.env.NOTES_WRITE_DB_NAME ?? 'notes_write_db',
};

export const notesReadDatabaseConfig = {
  host: process.env.NOTES_READ_DB_HOST ?? 'localhost',
  port: toNumber(process.env.NOTES_READ_DB_PORT, 5435),
  username: process.env.NOTES_READ_DB_USER ?? 'postgres',
  password: process.env.NOTES_READ_DB_PASSWORD ?? 'postgres',
  database: process.env.NOTES_READ_DB_NAME ?? 'notes_read_db',
};
