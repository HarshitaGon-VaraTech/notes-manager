import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCategoryCommand } from '../commands/update-category.command';
import { CategoryUpdatedEvent } from '../events/category-updated.event';
import { CategoriesService } from '../categories.service';
import { EventBus } from '@nestjs/cqrs';

@CommandHandler(UpdateCategoryCommand)
export class UpdateCategoryHandler implements ICommandHandler<UpdateCategoryCommand> {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateCategoryCommand) {
    const { id, name, description } = command;
    const category = await this.categoriesService.update(id, { name, description });

    // Publish event
    this.eventBus.publish(new CategoryUpdatedEvent(category.id, category.name, category.description));

    return category;
  }
}
