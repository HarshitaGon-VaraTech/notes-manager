import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { DeleteNotesByCategoryCommand } from '../commands/delete-notes-by-category.command';

@CommandHandler(DeleteNotesByCategoryCommand)
export class DeleteNotesByCategoryHandler implements ICommandHandler<DeleteNotesByCategoryCommand> {
  private readonly logger = new Logger(DeleteNotesByCategoryHandler.name);
  private readonly notesClient: ClientProxy;

  constructor() {
    this.notesClient = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://guest:guest@localhost:5672'],
        queue: 'notes_queue',
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  async execute(command: DeleteNotesByCategoryCommand) {
    const { categoryId } = command;

    this.logger.log(`Dispatching delete_notes_by_category_id for category ${categoryId}`);

    return firstValueFrom(
      this.notesClient.send('delete_notes_by_category_id', categoryId),
    );
  }
}
