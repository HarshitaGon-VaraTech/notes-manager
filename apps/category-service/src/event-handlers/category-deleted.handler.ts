import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CategoryDeletedEvent } from '../events/category-deleted.event';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryReadModel } from '../read-models/category.read-model';

@EventsHandler(CategoryDeletedEvent)
export class CategoryDeletedHandler implements IEventHandler<CategoryDeletedEvent> {
  constructor(
    @InjectRepository(CategoryReadModel, 'read')
    private readonly categoryReadRepository: Repository<CategoryReadModel>,
  ) {}

  async handle(event: CategoryDeletedEvent) {
    await this.categoryReadRepository.delete({ id: event.categoryId });
  }
}
