import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoteDeletedEvent } from '../events/note-deleted.event';
import { NoteReadModel } from '../read-models/note.read-model';

@EventsHandler(NoteDeletedEvent)
export class NoteDeletedSyncHandler implements IEventHandler<NoteDeletedEvent> {
  constructor(
    @InjectRepository(NoteReadModel, 'read')
    private readonly noteReadRepository: Repository<NoteReadModel>,
  ) {}

  async handle(event: NoteDeletedEvent) {
    await this.noteReadRepository.delete({ id: event.id });
  }
}
