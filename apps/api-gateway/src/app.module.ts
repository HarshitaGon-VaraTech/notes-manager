import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_FILTER } from '@nestjs/core';
import { NotesController } from './notes.controller';
import { CategoriesController } from './categories.controller';
import { RpcExceptionFilter } from './rpc-exception.filter';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NOTES_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@localhost:5672'],
          queue: 'notes_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: 'CATEGORY_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@localhost:5672'],
          queue: 'category_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [NotesController, CategoriesController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: RpcExceptionFilter,
    },
  ],
})
export class AppModule {}
