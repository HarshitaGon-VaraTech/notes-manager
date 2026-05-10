import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCategoryCommand } from '../commands/create-category.command';
import { CategoryCreatedEvent } from '../events/category-created.event';
import { CategoriesService } from '../categories.service';
import { EventBus } from '@nestjs/cqrs';

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler implements ICommandHandler<CreateCategoryCommand> {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateCategoryCommand) {
    const { name, description } = command;
    const category = await this.categoriesService.create({ name, description });

    // Publish event
    this.eventBus.publish(new CategoryCreatedEvent(category.id, category.name, category.description));

    return category;
  }
}
