import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { typeOrmWriteConfig } from './config/typeorm-write.config';
import { typeOrmReadConfig } from './config/typeorm-read.config';
import { Category } from './entities/category.entity';
import { CategoryReadModel } from './read-models/category.read-model';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

// Import Command Handlers
import { CreateCategoryHandler } from './command-handlers/create-category.handler';
import { UpdateCategoryHandler } from './command-handlers/update-category.handler';
import { DeleteCategoryHandler } from './command-handlers/delete-category.handler';
import { DeleteNotesByCategoryHandler } from './command-handlers/delete-notes-by-category.handler';

// Import Query Handlers
import { GetCategoriesHandler } from './query-handlers/get-categories.handler';
import { GetCategoryByIdHandler } from './query-handlers/get-category-by-id.handler';

// Import Event Handlers
import { CategoryCreatedSyncHandler } from './event-handlers/category-created-sync.handler';
import { CategoryUpdatedSyncHandler } from './event-handlers/category-updated-sync.handler';
import { CategoryDeletedHandler } from './event-handlers/category-deleted.handler';

// Import Saga
import { CategoryDeletionSaga } from './sagas/category-deletion.saga';

@Module({
  imports: [
    CqrsModule,
    // Write Database
    TypeOrmModule.forRoot(typeOrmWriteConfig),
    TypeOrmModule.forFeature([Category]),
    // Read Database
    TypeOrmModule.forRoot(typeOrmReadConfig),
    TypeOrmModule.forFeature([CategoryReadModel], 'read'),
  ],
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    // Command Handlers
    CreateCategoryHandler,
    UpdateCategoryHandler,
    DeleteCategoryHandler,
    DeleteNotesByCategoryHandler,
    // Query Handlers
    GetCategoriesHandler,
    GetCategoryByIdHandler,
    // Event Handlers
    CategoryCreatedSyncHandler,
    CategoryUpdatedSyncHandler,
    CategoryDeletedHandler,
    // Saga
    CategoryDeletionSaga,
  ],
})
export class AppModule {}
