import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetNotesQuery } from '../queries/get-notes.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoteReadModel } from '../read-models/note.read-model';

@QueryHandler(GetNotesQuery)
export class GetNotesHandler implements IQueryHandler<GetNotesQuery> {
  constructor(
    @InjectRepository(NoteReadModel, 'read')
    private readonly noteReadRepository: Repository<NoteReadModel>,
  ) {}

  async execute(query: GetNotesQuery) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.noteReadRepository.findAndCount({
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
