import { IEvent } from '@nestjs/cqrs';

export class CategoryDeletedEvent implements IEvent {
  constructor(
    public readonly categoryId: string,
  ) {}
}
