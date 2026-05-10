import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { typeOrmWriteConfig } from './config/typeorm-write.config';
import { typeOrmReadConfig } from './config/typeorm-read.config';
import { Note } from './entities/note.entity';
import { NoteReadModel } from './read-models/note.read-model';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';

// Import Command Handlers
import { CreateNoteHandler } from './command-handlers/create-note.handler';
import { UpdateNoteHandler } from './command-handlers/update-note.handler';
import { DeleteNoteHandler } from './command-handlers/delete-note.handler';
import { DeleteNotesByCategoryHandler } from './command-handlers/delete-notes-by-category.handler';

// Import Query Handlers
import { GetNotesHandler } from './query-handlers/get-notes.handler';
import { GetNoteByIdHandler } from './query-handlers/get-note-by-id.handler';

// Import Event Handlers
import { NoteCreatedSyncHandler } from './event-handlers/note-created-sync.handler';
import { NoteUpdatedSyncHandler } from './event-handlers/note-updated-sync.handler';
import { NoteDeletedSyncHandler } from './event-handlers/note-deleted-sync.handler';
import { NotesDeletedByCategorySyncHandler } from './event-handlers/notes-deleted-by-category-sync.handler';

@Module({
  imports: [
    CqrsModule,
    // Write Database
    TypeOrmModule.forRoot(typeOrmWriteConfig),
    TypeOrmModule.forFeature([Note]),
    // Read Database
    TypeOrmModule.forRoot(typeOrmReadConfig),
    TypeOrmModule.forFeature([NoteReadModel], 'read'),
  ],
  controllers: [NotesController],
  providers: [
    NotesService,
    // Command Handlers
    CreateNoteHandler,
    UpdateNoteHandler,
    DeleteNoteHandler,
    DeleteNotesByCategoryHandler,
    // Query Handlers
    GetNotesHandler,
    GetNoteByIdHandler,
    // Event Handlers
    NoteCreatedSyncHandler,
    NoteUpdatedSyncHandler,
    NoteDeletedSyncHandler,
    NotesDeletedByCategorySyncHandler,
  ],
})
export class AppModule {}
