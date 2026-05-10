import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateNoteCommand } from '../commands/create-note.command';
import { NoteCreatedEvent } from '../events/note-created.event';
import { NotesService } from '../notes.service';
import { EventBus } from '@nestjs/cqrs';

@CommandHandler(CreateNoteCommand)
export class CreateNoteHandler implements ICommandHandler<CreateNoteCommand> {
  constructor(
    private readonly notesService: NotesService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateNoteCommand) {
    const { title, content, categoryId } = command;
    const note = await this.notesService.create({ title, content, categoryId });

    // Publish event
    this.eventBus.publish(new NoteCreatedEvent(note.id, note.title, note.content, note.categoryId));

    return note;
  }
}
