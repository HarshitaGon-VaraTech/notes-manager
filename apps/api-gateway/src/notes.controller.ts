import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { PaginationDto } from './dto/pagination.dto';

@Controller('notes')
export class NotesController {
  constructor(
    @Inject('NOTES_SERVICE') private readonly notesClient: ClientProxy,
  ) {}

  @Post()
  create(@Body() createNoteDto: CreateNoteDto) {
    return this.notesClient.send('create_note', createNoteDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.notesClient.send('get_notes', paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notesClient.send('get_note_by_id', id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto) {
    return this.notesClient.send('update_note', { id, updateNoteDto });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notesClient.send('delete_note', id);
  }
}
