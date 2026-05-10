import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { notesWriteDatabaseConfig } from './database.config';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  ...notesWriteDatabaseConfig,
  entities: [__dirname + '/../entities/**/*.entity{.ts,.js}'],
  synchronize: false, // Set to false in production
  migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
};
