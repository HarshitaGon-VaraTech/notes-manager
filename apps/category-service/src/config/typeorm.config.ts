import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { categoryWriteDatabaseConfig } from './database.config';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  ...categoryWriteDatabaseConfig,
  entities: [__dirname + '/../entities/**/*.entity{.ts,.js}'],
  synchronize: false, // Set to false in production
  migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
};
