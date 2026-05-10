import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteCategoryCommand } from '../commands/delete-category.command';
import { CategoryDeletedEvent } from '../events/category-deleted.event';
import { CategoriesService } from '../categories.service';
import { EventBus } from '@nestjs/cqrs';

@CommandHandler(DeleteCategoryCommand)
export class DeleteCategoryHandler implements ICommandHandler<DeleteCategoryCommand> {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteCategoryCommand) {
    const { id } = command;
    const category = await this.categoriesService.remove(id);

    // Publish event for saga to handle
    this.eventBus.publish(new CategoryDeletedEvent(id));

    return category;
  }
}
