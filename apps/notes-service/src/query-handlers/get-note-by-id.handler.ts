import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetNoteByIdQuery } from '../queries/get-note-by-id.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoteReadModel } from '../read-models/note.read-model';
import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';

@QueryHandler(GetNoteByIdQuery)
export class GetNoteByIdHandler implements IQueryHandler<GetNoteByIdQuery> {
  constructor(
    @InjectRepository(NoteReadModel, 'read')
    private readonly noteReadRepository: Repository<NoteReadModel>,
  ) {}

  async execute(query: GetNoteByIdQuery) {
    const note = await this.noteReadRepository.findOne({ where: { id: query.id } });
    
    if (!note) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Note with id ${query.id} not found`,
      });
    }
    
    return note;
  }
}
