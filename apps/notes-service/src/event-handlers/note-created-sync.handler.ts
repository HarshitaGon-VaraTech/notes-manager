import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { NoteCreatedEvent } from '../events/note-created.event';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoteReadModel } from '../read-models/note.read-model';

@EventsHandler(NoteCreatedEvent)
export class NoteCreatedSyncHandler implements IEventHandler<NoteCreatedEvent> {
  constructor(
    @InjectRepository(NoteReadModel, 'read')
    private readonly noteReadRepository: Repository<NoteReadModel>,
  ) {}

  async handle(event: NoteCreatedEvent) {
    const readModel = this.noteReadRepository.create({
      id: event.id,
      title: event.title,
      content: event.content,
      categoryId: event.categoryId,
    });
    
    await this.noteReadRepository.save(readModel);
  }
}
