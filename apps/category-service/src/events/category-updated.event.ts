import { IEvent } from '@nestjs/cqrs';

export class CategoryUpdatedEvent implements IEvent {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description?: string,
  ) {}
}
