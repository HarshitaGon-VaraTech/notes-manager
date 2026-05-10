import { IEvent } from '@nestjs/cqrs';

export class NotesDeletedByCategoryEvent implements IEvent {
  constructor(
    public readonly categoryId: string,
    public readonly deletedCount: number,
  ) {}
}
