import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CategoryUpdatedEvent } from '../events/category-updated.event';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryReadModel } from '../read-models/category.read-model';

@EventsHandler(CategoryUpdatedEvent)
export class CategoryUpdatedSyncHandler implements IEventHandler<CategoryUpdatedEvent> {
  constructor(
    @InjectRepository(CategoryReadModel, 'read')
    private readonly categoryReadRepository: Repository<CategoryReadModel>,
  ) {}

  async handle(event: CategoryUpdatedEvent) {
    const readModel = await this.categoryReadRepository.findOne({ where: { id: event.id } });
    
    if (readModel) {
      Object.assign(readModel, {
        name: event.name,
        description: event.description,
      });
      await this.categoryReadRepository.save(readModel);
    }
  }
}
