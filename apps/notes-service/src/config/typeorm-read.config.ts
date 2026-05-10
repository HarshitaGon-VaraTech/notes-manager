import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { notesReadDatabaseConfig } from './database.config';

export const typeOrmReadConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  ...notesReadDatabaseConfig,
  name: 'read',
  entities: [__dirname + '/../read-models/**/*.read-model{.ts,.js}'],
  synchronize: true,
  migrations: [__dirname + '/../migrations/read/**/*{.ts,.js}'],
};
