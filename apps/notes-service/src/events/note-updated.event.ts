import { IEvent } from '@nestjs/cqrs';

export class NoteUpdatedEvent implements IEvent {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly content: string,
    public readonly categoryId?: string,
  ) {}
}
