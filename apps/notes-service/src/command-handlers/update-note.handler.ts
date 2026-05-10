import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateNoteCommand } from '../commands/update-note.command';
import { NoteUpdatedEvent } from '../events/note-updated.event';
import { NotesService } from '../notes.service';
import { EventBus } from '@nestjs/cqrs';

@CommandHandler(UpdateNoteCommand)
export class UpdateNoteHandler implements ICommandHandler<UpdateNoteCommand> {
  constructor(
    private readonly notesService: NotesService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateNoteCommand) {
    const { id, title, content, categoryId } = command;
    const note = await this.notesService.update(id, { title, content, categoryId });

    // Publish event
    this.eventBus.publish(new NoteUpdatedEvent(note.id, note.title, note.content, note.categoryId));

    return note;
  }
}
