import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteNoteCommand } from '../commands/delete-note.command';
import { NoteDeletedEvent } from '../events/note-deleted.event';
import { NotesService } from '../notes.service';
import { EventBus } from '@nestjs/cqrs';

@CommandHandler(DeleteNoteCommand)
export class DeleteNoteHandler implements ICommandHandler<DeleteNoteCommand> {
  constructor(
    private readonly notesService: NotesService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteNoteCommand) {
    const { id } = command;
    const note = await this.notesService.remove(id);

    this.eventBus.publish(new NoteDeletedEvent(note.id));

    return note;
  }
}
