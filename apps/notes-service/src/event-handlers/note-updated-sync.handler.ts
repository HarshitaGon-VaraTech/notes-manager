import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { NoteUpdatedEvent } from '../events/note-updated.event';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoteReadModel } from '../read-models/note.read-model';

@EventsHandler(NoteUpdatedEvent)
export class NoteUpdatedSyncHandler implements IEventHandler<NoteUpdatedEvent> {
  constructor(
    @InjectRepository(NoteReadModel, 'read')
    private readonly noteReadRepository: Repository<NoteReadModel>,
  ) {}

  async handle(event: NoteUpdatedEvent) {
    const readModel = await this.noteReadRepository.findOne({ where: { id: event.id } });
    
    if (readModel) {
      Object.assign(readModel, {
        title: event.title,
        content: event.content,
        categoryId: event.categoryId,
      });
      await this.noteReadRepository.save(readModel);
    }
  }
}
