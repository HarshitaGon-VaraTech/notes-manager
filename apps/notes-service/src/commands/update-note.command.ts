import { ICommand } from '@nestjs/cqrs';

export class UpdateNoteCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly title?: string,
    public readonly content?: string,
    public readonly categoryId?: string,
  ) {}
}
