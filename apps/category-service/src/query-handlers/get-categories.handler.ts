import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetCategoriesQuery } from '../queries/get-categories.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryReadModel } from '../read-models/category.read-model';

@QueryHandler(GetCategoriesQuery)
export class GetCategoriesHandler implements IQueryHandler<GetCategoriesQuery> {
  constructor(
    @InjectRepository(CategoryReadModel, 'read')
    private readonly categoryReadRepository: Repository<CategoryReadModel>,
  ) {}

  async execute(query: GetCategoriesQuery) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.categoryReadRepository.findAndCount({
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
