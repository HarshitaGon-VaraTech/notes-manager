import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { categoryWriteDatabaseConfig } from './database.config';

export const typeOrmWriteConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  ...categoryWriteDatabaseConfig,
  entities: [__dirname + '/../entities/**/*.entity{.ts,.js}'],
  synchronize: false,
  migrationsRun: true,
  migrations: [__dirname + '/../migrations/write/**/*{.ts,.js}'],
};
