import { IQuery } from '@nestjs/cqrs';

export class GetNoteByIdQuery implements IQuery {
  constructor(
    public readonly id: string,
  ) {}
}
