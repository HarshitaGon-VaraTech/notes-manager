const toNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const categoryWriteDatabaseConfig = {
  host: process.env.CATEGORY_WRITE_DB_HOST ?? 'localhost',
  port: toNumber(process.env.CATEGORY_WRITE_DB_PORT, 5432),
  username: process.env.CATEGORY_WRITE_DB_USER ?? 'postgres',
  password: process.env.CATEGORY_WRITE_DB_PASSWORD ?? 'postgres',
  database: process.env.CATEGORY_WRITE_DB_NAME ?? 'category_write_db',
};

export const categoryReadDatabaseConfig = {
  host: process.env.CATEGORY_READ_DB_HOST ?? 'localhost',
  port: toNumber(process.env.CATEGORY_READ_DB_PORT, 5434),
  username: process.env.CATEGORY_READ_DB_USER ?? 'postgres',
  password: process.env.CATEGORY_READ_DB_PASSWORD ?? 'postgres',
  database: process.env.CATEGORY_READ_DB_NAME ?? 'category_read_db',
};
