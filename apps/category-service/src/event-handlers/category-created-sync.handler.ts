import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CategoryCreatedEvent } from '../events/category-created.event';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryReadModel } from '../read-models/category.read-model';

@EventsHandler(CategoryCreatedEvent)
export class CategoryCreatedSyncHandler implements IEventHandler<CategoryCreatedEvent> {
  constructor(
    @InjectRepository(CategoryReadModel, 'read')
    private readonly categoryReadRepository: Repository<CategoryReadModel>,
  ) {}

  async handle(event: CategoryCreatedEvent) {
    const readModel = this.categoryReadRepository.create({
      id: event.id,
      name: event.name,
      description: event.description,
    });
    
    await this.categoryReadRepository.save(readModel);
  }
}
