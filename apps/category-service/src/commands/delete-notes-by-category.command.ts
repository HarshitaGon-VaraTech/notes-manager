import { ICommand } from '@nestjs/cqrs';

export class DeleteNotesByCategoryCommand implements ICommand {
  constructor(
    public readonly categoryId: string,
  ) {}
}
