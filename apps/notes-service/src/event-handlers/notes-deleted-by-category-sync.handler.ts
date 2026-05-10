import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotesDeletedByCategoryEvent } from '../events/notes-deleted-by-category.event';
import { NoteReadModel } from '../read-models/note.read-model';

@EventsHandler(NotesDeletedByCategoryEvent)
export class NotesDeletedByCategorySyncHandler
  implements IEventHandler<NotesDeletedByCategoryEvent>
{
  constructor(
    @InjectRepository(NoteReadModel, 'read')
    private readonly noteReadRepository: Repository<NoteReadModel>,
  ) {}

  async handle(event: NotesDeletedByCategoryEvent) {
    await this.noteReadRepository.delete({ categoryId: event.categoryId });
  }
}
