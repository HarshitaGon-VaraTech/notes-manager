import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const category = this.categoriesRepository.create({
      id: uuidv4(),
      ...createCategoryDto,
    });

    try {
      return await this.categoriesRepository.save(category);
    } catch (error) {
      this.handlePersistenceError(error, createCategoryDto.name);
    }
  }

  async findOne(id: string) {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Category with id ${id} not found`,
      });
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    Object.assign(category, updateCategoryDto);

    try {
      return await this.categoriesRepository.save(category);
    } catch (error) {
      this.handlePersistenceError(error, updateCategoryDto.name);
    }
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    return this.categoriesRepository.remove(category);
  }

  private handlePersistenceError(error: unknown, categoryName?: string): never {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as {
        code?: string;
        detail?: string;
        message?: string;
      };

      if (driverError.code === '23505') {
        throw new RpcException({
          status: HttpStatus.CONFLICT,
          message: categoryName
            ? `Category with name "${categoryName}" already exists`
            : 'Category already exists',
        });
      }

      if (driverError.code === '42P01') {
        this.logger.error(
          'Category write table is missing. Run migrations or restart the service to auto-run them.',
        );
      }
    }

    this.logger.error(
      'Failed to persist category',
      error instanceof Error ? error.stack : String(error),
    );

    throw new RpcException({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Failed to persist category',
    });
  }
}
