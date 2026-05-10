import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteNotesByCategoryCommand } from '../commands/delete-notes-by-category.command';
import { NotesDeletedByCategoryEvent } from '../events/notes-deleted-by-category.event';
import { NotesService } from '../notes.service';

@CommandHandler(DeleteNotesByCategoryCommand)
export class DeleteNotesByCategoryHandler
  implements ICommandHandler<DeleteNotesByCategoryCommand>
{
  constructor(
    private readonly notesService: NotesService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteNotesByCategoryCommand) {
    const { categoryId } = command;
    const result = await this.notesService.removeByCategoryId(categoryId);

    this.eventBus.publish(
      new NotesDeletedByCategoryEvent(categoryId, result.deletedCount),
    );

    return result;
  }
}
