import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetCategoryByIdQuery } from '../queries/get-category-by-id.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryReadModel } from '../read-models/category.read-model';
import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';

@QueryHandler(GetCategoryByIdQuery)
export class GetCategoryByIdHandler implements IQueryHandler<GetCategoryByIdQuery> {
  constructor(
    @InjectRepository(CategoryReadModel, 'read')
    private readonly categoryReadRepository: Repository<CategoryReadModel>,
  ) {}

  async execute(query: GetCategoryByIdQuery) {
    const category = await this.categoryReadRepository.findOne({ where: { id: query.id } });
    
    if (!category) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Category with id ${query.id} not found`,
      });
    }
    
    return category;
  }
}
