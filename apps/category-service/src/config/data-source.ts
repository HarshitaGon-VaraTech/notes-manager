import { DataSource } from 'typeorm';
import { join } from 'path';
import { categoryWriteDatabaseConfig } from './database.config';

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...categoryWriteDatabaseConfig,
  entities: [join(__dirname, '..', 'entities', '**', '*.entity{.ts,.js}')],
  synchronize: false,
  migrations: [join(__dirname, '..', 'migrations', 'write', '**', '*{.ts,.js}')],
});
