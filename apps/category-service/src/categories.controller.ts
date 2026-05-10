import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateCategoryCommand } from './commands/create-category.command';
import { UpdateCategoryCommand } from './commands/update-category.command';
import { DeleteCategoryCommand } from './commands/delete-category.command';
import { GetCategoriesQuery } from './queries/get-categories.query';
import { GetCategoryByIdQuery } from './queries/get-category-by-id.query';

@Controller()
export class CategoriesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly categoriesService: CategoriesService, // Keep for reference
  ) {}

  @MessagePattern('create_category')
  create(@Payload() createCategoryDto: CreateCategoryDto) {
    return this.commandBus.execute(
      new CreateCategoryCommand(createCategoryDto.name, createCategoryDto.description),
    );
  }

  @MessagePattern('get_categories')
  findAll(@Payload() payload: { page?: number; limit?: number } = {}) {
    const { page = 1, limit = 10 } = payload;
    return this.queryBus.execute(new GetCategoriesQuery(page, limit));
  }

  @MessagePattern('get_category_by_id')
  findOne(@Payload() id: string) {
    return this.queryBus.execute(new GetCategoryByIdQuery(id));
  }

  @MessagePattern('update_category')
  update(@Payload() payload: { id: string; updateCategoryDto: UpdateCategoryDto }) {
    return this.commandBus.execute(
      new UpdateCategoryCommand(
        payload.id,
        payload.updateCategoryDto.name,
        payload.updateCategoryDto.description,
      ),
    );
  }

  @MessagePattern('delete_category')
  remove(@Payload() id: string) {
    return this.commandBus.execute(new DeleteCategoryCommand(id));
  }
}
