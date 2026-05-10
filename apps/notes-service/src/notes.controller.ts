import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { CreateNoteCommand } from './commands/create-note.command';
import { UpdateNoteCommand } from './commands/update-note.command';
import { DeleteNoteCommand } from './commands/delete-note.command';
import { DeleteNotesByCategoryCommand } from './commands/delete-notes-by-category.command';
import { GetNotesQuery } from './queries/get-notes.query';
import { GetNoteByIdQuery } from './queries/get-note-by-id.query';

@Controller()
export class NotesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern('create_note')
  create(@Payload() createNoteDto: CreateNoteDto) {
    return this.commandBus.execute(
      new CreateNoteCommand(createNoteDto.title, createNoteDto.content, createNoteDto.categoryId),
    );
  }

  @MessagePattern('get_notes')
  findAll(@Payload() payload: { page?: number; limit?: number } = {}) {
    const { page = 1, limit = 10 } = payload;
    return this.queryBus.execute(new GetNotesQuery(page, limit));
  }

  @MessagePattern('get_note_by_id')
  findOne(@Payload() id: string) {
    return this.queryBus.execute(new GetNoteByIdQuery(id));
  }

  @MessagePattern('update_note')
  update(@Payload() payload: { id: string; updateNoteDto: UpdateNoteDto }) {
    return this.commandBus.execute(
      new UpdateNoteCommand(
        payload.id,
        payload.updateNoteDto.title,
        payload.updateNoteDto.content,
        payload.updateNoteDto.categoryId,
      ),
    );
  }

  @MessagePattern('delete_note')
  remove(@Payload() id: string) {
    return this.commandBus.execute(new DeleteNoteCommand(id));
  }

  @MessagePattern('delete_notes_by_category_id')
  removeByCategoryId(@Payload() categoryId: string) {
    return this.commandBus.execute(new DeleteNotesByCategoryCommand(categoryId));
  }
}
