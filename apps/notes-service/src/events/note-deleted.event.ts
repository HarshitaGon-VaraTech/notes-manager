import { IEvent } from '@nestjs/cqrs';

export class NoteDeletedEvent implements IEvent {
  constructor(
    public readonly id: string,
  ) {}
}
