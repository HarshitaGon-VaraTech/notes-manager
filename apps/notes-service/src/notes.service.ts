import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Note } from './entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private notesRepository: Repository<Note>,
  ) {}

  async create(createNoteDto: CreateNoteDto) {
    const note = this.notesRepository.create({
      id: uuidv4(),
      ...createNoteDto,
    });

    try {
      return await this.notesRepository.save(note);
    } catch (error) {
      this.handlePersistenceError(error, createNoteDto.title);
    }
  }

  // async findAll() {
  //   return this.notesRepository.find();
  // }

  async findOne(id: string) {
    const note = await this.notesRepository.findOne({ where: { id } });
    if (!note) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Note with id ${id} not found`,
      });
    }
    return note;
  }

  async update(id: string, updateNoteDto: UpdateNoteDto) {
    const note = await this.findOne(id);
    Object.assign(note, updateNoteDto);

    try {
      return await this.notesRepository.save(note);
    } catch (error) {
      this.handlePersistenceError(error, updateNoteDto.title);
    }
  }

  async remove(id: string) {
    const note = await this.findOne(id);
    return this.notesRepository.remove(note);
  }

  async removeByCategoryId(categoryId: string) {
    const result = await this.notesRepository.delete({ categoryId });
    return {
      deletedCount: result.affected ?? 0,
    };
  }

  private handlePersistenceError(error: unknown, noteTitle?: string): never {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as { code?: string };

      if (driverError.code === '23505') {
        throw new RpcException({
          status: HttpStatus.CONFLICT,
          message: noteTitle
            ? `Note with title "${noteTitle}" already exists`
            : 'Note already exists',
        });
      }
    }

    throw new RpcException({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Failed to persist note',
    });
  }
}
