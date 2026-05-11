# Notes Manager - Complete Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Service Communication via RabbitMQ](#service-communication-via-rabbitmq)
4. [CQRS Pattern Implementation](#cqrs-pattern-implementation)
5. [Saga Pattern Implementation](#saga-pattern-implementation)
6. [Database Architecture](#database-architecture)
7. [Complete Request Flows](#complete-request-flows)
8. [Coordination Between Components](#coordination-between-components)

---

## Overview

The Notes Manager is a microservices-based application built with NestJS that implements advanced architectural patterns including CQRS (Command Query Responsibility Segregation), Saga pattern, and event-driven architecture. The system consists of three main services:

1. **API Gateway** - Entry point for all HTTP requests
2. **Category Service** - Manages category operations with CQRS and Saga
3. **Notes Service** - Manages note operations with CQRS

### Technology Stack
- **Framework**: NestJS (TypeScript)
- **Message Broker**: RabbitMQ
- **Database**: PostgreSQL (4 separate databases)
- **ORM**: TypeORM
- **Pattern**: CQRS with Event Sourcing elements
- **Communication**: RPC over RabbitMQ

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway                              │
│                    (Port: 3000 or ENV)                          │
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │ Categories       │         │ Notes            │            │
│  │ Controller       │         │ Controller       │            │
│  └────────┬─────────┘         └────────┬─────────┘            │
│           │                            │                        │
│           └────────────┬───────────────┘                        │
│                        │                                        │
│                 ┌──────▼──────┐                                 │
│                 │ ClientProxy │                                 │
│                 │   (RMQ)     │                                 │
│                 └──────┬──────┘                                 │
└────────────────────────┼────────────────────────────────────────┘
                         │
                    ┌────▼────┐
                    │RabbitMQ │
                    │:5672    │
                    └────┬────┘
                         │
            ┌────────────┼────────────┐
            │            │            │
      ┌─────▼─────┐ ┌───▼────┐ ┌────▼─────┐
      │ Category  │ │ Notes  │ │ (Future  │
      │ Service  │ │Service │ │ Services)│
      │ Queue    │ │ Queue  │ │          │
      └─────┬─────┘ └───┬────┘ └──────────┘
            │            │
      ┌─────▼─────┐ ┌───▼────┐
      │ Category  │ │ Notes  │
      │ Service  │ │Service │
      │ (CQRS)   │ │ (CQRS) │
      └─────┬─────┘ └───┬────┘
            │            │
    ┌───────┼───────┐   │
    │       │       │   │
┌───▼───┐ ┌─▼───┐ ┌─▼───▼───┐
│Write  │ │Read │ │Write    │
│DB     │ │DB   │ │DB       │
│:5432  │ │:5434│ │:5433    │
└───────┘ └─────┘ └────┬────┘
                       │
                  ┌────▼────┐
                  │Read     │
                  │DB       │
                  │:5435    │
                  └─────────┘
```

---

## Service Communication via RabbitMQ

### RabbitMQ Role

RabbitMQ serves as the central message broker that enables asynchronous communication between services. It implements the Request-Reply pattern using RPC (Remote Procedure Call) over AMQP (Advanced Message Queuing Protocol).

### Queue Configuration

Each service has its dedicated queue:

1. **category_queue** - For category service operations
2. **notes_queue** - For notes service operations

### Connection Details

```typescript
// All services connect to:
urls: ['amqp://guest:guest@localhost:5672']
queueOptions: { durable: true }
noAck: false  // Manual acknowledgment for reliability
```

### Communication Pattern

**API Gateway → Microservices (Request-Reply)**

The API Gateway acts as a client that sends RPC messages to microservices:

```typescript
// API Gateway sends message
this.categoryClient.send('create_category', createCategoryDto)
// Returns Observable that waits for response from Category Service
```

**Microservice → Microservice (Saga Pattern)**

Services can communicate with each other directly via RabbitMQ during saga execution:

```typescript
// Category Service communicates with Notes Service during saga
this.notesClient.send('delete_notes_by_category_id', categoryId)
```

### Message Patterns

1. **Command Messages** - For write operations (create, update, delete)
2. **Query Messages** - For read operations (get, list)
3. **Event Messages** - Internal to services for CQRS event handling

---

## CQRS Pattern Implementation

### What is CQRS?

CQRS (Command Query Responsibility Segregation) separates the application into two distinct parts:
- **Command Side** - Handles write operations (modifications)
- **Query Side** - Handles read operations (retrievals)

### Implementation in Both Services

Both Category and Notes services implement CQRS using NestJS CQRS module.

#### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CQRS Architecture                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  WRITE SIDE (Command)          READ SIDE (Query)            │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │ Controller       │         │ Controller       │        │
│  │ @MessagePattern  │         │ @MessagePattern  │        │
│  └────────┬─────────┘         └────────┬─────────┘        │
│           │                            │                   │
│      ┌────▼─────┐                 ┌────▼─────┐             │
│      │CommandBus│                 │ QueryBus │             │
│      └────┬─────┘                 └────┬─────┘             │
│           │                            │                   │
│  ┌────────▼────────┐          ┌────────▼────────┐         │
│  │Command Handler  │          │ Query Handler   │         │
│  │(Business Logic) │          │ (Data Retrieval)│         │
│  └────────┬────────┘          └────────┬────────┘         │
│           │                            │                   │
│      ┌────▼─────┐                 ┌────▼─────┐             │
│      │ Service  │                 │Read Model│             │
│      │(Write DB)│                 │(Read DB) │             │
│      └────┬─────┘                 └──────────┘             │
│           │                                                  │
│      ┌────▼─────┐                                            │
│      │ EventBus │                                            │
│      └────┬─────┘                                            │
│           │                                                  │
│  ┌────────▼────────┐                                        │
│  │ Event Handler   │                                        │
│  │ (Sync to Read)  │                                        │
│  └────────┬────────┘                                        │
│           │                                                  │
│      ┌────▼─────┐                                            │
│      │Read Model│                                            │
│      │(Read DB) │                                            │
│      └──────────┘                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Command Side (Write Operations)

#### Components

1. **Commands** - Immutable objects representing write intentions
   - `CreateCategoryCommand`
   - `UpdateCategoryCommand`
   - `DeleteCategoryCommand`
   - `DeleteNotesByCategoryCommand`
   - `CreateNoteCommand`
   - `UpdateNoteCommand`
   - `DeleteNoteCommand`

2. **Command Handlers** - Handle command execution
   - Execute business logic
   - Persist to write database
   - Publish events

Example from Category Service:

```typescript
@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler implements ICommandHandler<CreateCategoryCommand> {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateCategoryCommand) {
    const { name, description } = command;
    // 1. Persist to write database
    const category = await this.categoriesService.create({ name, description });
    
    // 2. Publish event for read model synchronization
    this.eventBus.publish(new CategoryCreatedEvent(category.id, category.name, category.description));
    
    return category;
  }
}
```

### Query Side (Read Operations)

#### Components

1. **Queries** - Immutable objects representing read requests
   - `GetCategoriesQuery`
   - `GetCategoryByIdQuery`
   - `GetNotesQuery`
   - `GetNoteByIdQuery`

2. **Query Handlers** - Handle query execution
   - Query only read database
   - Optimized for read performance
   - No side effects

Example from Category Service:

```typescript
@QueryHandler(GetCategoriesQuery)
export class GetCategoriesHandler implements IQueryHandler<GetCategoriesQuery> {
  constructor(
    @InjectRepository(CategoryReadModel, 'read')
    private readonly categoryReadRepository: Repository<CategoryReadModel>,
  ) {}

  async execute(query: GetCategoriesQuery) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    // Query only read database
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
```

### Event Synchronization

#### Components

1. **Events** - Represent state changes
   - `CategoryCreatedEvent`
   - `CategoryUpdatedEvent`
   - `CategoryDeletedEvent`
   - `NoteCreatedEvent`
   - `NoteUpdatedEvent`
   - `NoteDeletedEvent`
   - `NotesDeletedByCategoryEvent`

2. **Event Handlers** - Synchronize read models
   - Subscribe to events
   - Update read database
   - Ensure eventual consistency

Example from Category Service:

```typescript
@EventsHandler(CategoryCreatedEvent)
export class CategoryCreatedSyncHandler implements IEventHandler<CategoryCreatedEvent> {
  constructor(
    @InjectRepository(CategoryReadModel, 'read')
    private readonly categoryReadRepository: Repository<CategoryReadModel>,
  ) {}

  async handle(event: CategoryCreatedEvent) {
    // Synchronize to read database
    const readModel = this.categoryReadRepository.create({
      id: event.id,
      name: event.name,
      description: event.description,
    });
    
    await this.categoryReadRepository.save(readModel);
  }
}
```

### Benefits of CQRS Implementation

1. **Separation of Concerns** - Clear separation between read and write logic
2. **Performance Optimization** - Read models can be optimized for queries
3. **Scalability** - Read and write sides can scale independently
4. **Flexibility** - Different data models for read vs write
5. **Event-Driven** - Events enable loose coupling and extensibility

---

## Saga Pattern Implementation

### What is Saga?

Saga is a pattern for managing distributed transactions. It breaks a transaction into a sequence of local transactions, each updating data within a single service. If a step fails, compensating transactions undo the changes made by preceding transactions.

### Implementation in Category Service

The Category Service implements a Saga to handle the deletion of a category and its associated notes. This is a cross-service transaction that requires coordination between Category and Notes services.

#### Saga Flow: Category Deletion

```
┌─────────────────────────────────────────────────────────────────┐
│              Category Deletion Saga Flow                         │
└─────────────────────────────────────────────────────────────────┘

1. User Request
   └─> DELETE /categories/:id
       └─> API Gateway
           └─> RabbitMQ: 'delete_category'

2. Category Service Receives Command
   └─> DeleteCategoryCommand
       └─> DeleteCategoryHandler
           ├─> Delete category from write DB
           └─> Publish CategoryDeletedEvent

3. Saga Listens to Event
   └─> CategoryDeletionSaga
       └─> ofType(CategoryDeletedEvent)
           └─> Emit DeleteNotesByCategoryCommand

4. Category Service Executes Saga Command
   └─> DeleteNotesByCategoryHandler
       ├─> Create RabbitMQ client to Notes Service
       └─> Send 'delete_notes_by_category_id' to Notes Service

5. Notes Service Receives Command
   └─> DeleteNotesByCategoryCommand
       └─> DeleteNotesByCategoryHandler
           ├─> Delete notes from write DB
           └─> Publish NotesDeletedByCategoryEvent

6. Notes Service Syncs Read Model
   └─> NotesDeletedByCategorySyncHandler
       └─> Delete notes from read DB

7. Category Service Syncs Read Model
   └─> CategoryDeletedHandler
       └─> Delete category from read DB

8. Response to User
   └─> Category deletion complete
       └─> All associated notes deleted
```

#### Saga Implementation Code

```typescript
@Injectable()
export class CategoryDeletionSaga {
  private readonly logger = new Logger(CategoryDeletionSaga.name);

  @Saga()
  categoryDeleted = (events$: Observable<any>): Observable<DeleteNotesByCategoryCommand> => {
    return events$.pipe(
      ofType(CategoryDeletedEvent),
      map((event) => {
        this.logger.log(`Saga: Processing category deletion for ${event.categoryId}`);
        // Emit command to delete notes in the same service
        return new DeleteNotesByCategoryCommand(event.categoryId);
      }),
    );
  };
}
```

#### Cross-Service Command Handler

```typescript
@CommandHandler(DeleteNotesByCategoryCommand)
export class DeleteNotesByCategoryHandler implements ICommandHandler<DeleteNotesByCategoryCommand> {
  private readonly logger = new Logger(DeleteNotesByCategoryHandler.name);
  private readonly notesClient: ClientProxy;

  constructor() {
    // Create RabbitMQ client to communicate with Notes Service
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

    // Send RPC command to Notes Service
    return firstValueFrom(
      this.notesClient.send('delete_notes_by_category_id', categoryId),
    );
  }
}
```

### Saga Benefits

1. **Distributed Transactions** - Manages transactions across multiple services
2. **Event-Driven** - Uses events to trigger saga steps
3. **Loose Coupling** - Services communicate via events and commands
4. **Reliability** - Each step is a local transaction with its own rollback
5. **Observability** - Each step can be logged and monitored

---

## Database Architecture

### Database Separation

The system uses **4 separate PostgreSQL databases** to implement complete CQRS separation:

#### Category Service Databases

1. **category_write_db** (Port: 5432)
   - Purpose: Write operations for categories
   - Entity: `Category`
   - Table: `category`
   - Configuration: Migrations enabled, synchronize disabled

2. **category_read_db** (Port: 5434)
   - Purpose: Read operations for categories
   - Entity: `CategoryReadModel`
   - Table: `category_read`
   - Configuration: Synchronize enabled (for simplicity)

#### Notes Service Databases

3. **notes_write_db** (Port: 5433)
   - Purpose: Write operations for notes
   - Entity: `Note`
   - Table: `note`
   - Configuration: Migrations enabled, synchronize disabled

4. **notes_read_db** (Port: 5435)
   - Purpose: Read operations for notes
   - Entity: `NoteReadModel`
   - Table: `note_read`
   - Configuration: Synchronize enabled (for simplicity)

### Database Configuration

```typescript
// Category Write Database
export const typeOrmWriteConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.CATEGORY_WRITE_DB_HOST ?? 'localhost',
  port: toNumber(process.env.CATEGORY_WRITE_DB_PORT, 5432),
  username: process.env.CATEGORY_WRITE_DB_USER ?? 'postgres',
  password: process.env.CATEGORY_WRITE_DB_PASSWORD ?? 'postgres',
  database: process.env.CATEGORY_WRITE_DB_NAME ?? 'category_write_db',
  entities: [__dirname + '/../entities/**/*.entity{.ts,.js}'],
  synchronize: false,
  migrationsRun: true,
  migrations: [__dirname + '/../migrations/write/**/*{.ts,.js}'],
};

// Category Read Database
export const typeOrmReadConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  name: 'read',  // Named connection for read DB
  host: process.env.CATEGORY_READ_DB_HOST ?? 'localhost',
  port: toNumber(process.env.CATEGORY_READ_DB_PORT, 5434),
  username: process.env.CATEGORY_READ_DB_USER ?? 'postgres',
  password: process.env.CATEGORY_READ_DB_PASSWORD ?? 'postgres',
  database: process.env.CATEGORY_READ_DB_NAME ?? 'category_read_db',
  entities: [__dirname + '/../read-models/**/*.read-model{.ts,.js}'],
  synchronize: true,
  migrations: [__dirname + '/../migrations/read/**/*{.ts,.js}'],
};
```

### Entity Models

#### Category Write Entity

```typescript
@Entity()
@Unique(['name'])
export class Category {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;
}
```

#### Category Read Model

```typescript
@Entity('category_read')
export class CategoryReadModel {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;
}
```

#### Note Write Entity

```typescript
@Entity()
@Unique(['title'])
export class Note {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  categoryId: string;
}
```

#### Note Read Model

```typescript
@Entity('note_read')
export class NoteReadModel {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  categoryId: string;
}
```

### Data Flow

```
Write Operation:
API Gateway → Command → Command Handler → Service → Write DB → Event → Event Handler → Read DB

Read Operation:
API Gateway → Query → Query Handler → Read DB → Response
```

---

## Complete Request Flows

### Flow 1: Create Category

```
┌─────────────────────────────────────────────────────────────────┐
│                    CREATE CATEGORY FLOW                          │
└─────────────────────────────────────────────────────────────────┘

1. HTTP Request
   POST http://localhost:3000/categories
   Body: { "name": "Work", "description": "Work-related notes" }

2. API Gateway
   ├─> CategoriesController.create()
   │   └─> categoryClient.send('create_category', dto)
   └─> RabbitMQ: Message to category_queue

3. Category Service
   ├─> CategoriesController @MessagePattern('create_category')
   │   └─> CommandBus.execute(new CreateCategoryCommand(name, description))
   │
   ├─> CreateCategoryHandler
   │   ├─> CategoriesService.create()
   │   │   └─> Write to category_write_db.category
   │   └─> EventBus.publish(new CategoryCreatedEvent(id, name, description))
   │
   ├─> CategoryCreatedSyncHandler
   │   └─> Write to category_read_db.category_read
   │
   └─> Return category to API Gateway

4. API Gateway
   └─> Return category to client

Response:
{
  "id": "uuid",
  "name": "Work",
  "description": "Work-related notes"
}
```

### Flow 2: Get Categories (Read)

```
┌─────────────────────────────────────────────────────────────────┐
│                    GET CATEGORIES FLOW                           │
└─────────────────────────────────────────────────────────────────┘

1. HTTP Request
   GET http://localhost:3000/categories?page=1&limit=10

2. API Gateway
   ├─> CategoriesController.findAll()
   │   └─> categoryClient.send('get_categories', { page, limit })
   └─> RabbitMQ: Message to category_queue

3. Category Service
   ├─> CategoriesController @MessagePattern('get_categories')
   │   └─> QueryBus.execute(new GetCategoriesQuery(page, limit))
   │
   ├─> GetCategoriesHandler
   │   └─> Query category_read_db.category_read (NOT write DB)
   │       └─> Return paginated results
   │
   └─> Return results to API Gateway

4. API Gateway
   └─> Return results to client

Response:
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

### Flow 3: Create Note

```
┌─────────────────────────────────────────────────────────────────┐
│                      CREATE NOTE FLOW                            │
└─────────────────────────────────────────────────────────────────┘

1. HTTP Request
   POST http://localhost:3000/notes
   Body: { 
     "title": "Meeting Notes", 
     "content": "Discuss project timeline",
     "categoryId": "uuid"
   }

2. API Gateway
   ├─> NotesController.create()
   │   └─> notesClient.send('create_note', dto)
   └─> RabbitMQ: Message to notes_queue

3. Notes Service
   ├─> NotesController @MessagePattern('create_note')
   │   └─> CommandBus.execute(new CreateNoteCommand(title, content, categoryId))
   │
   ├─> CreateNoteHandler
   │   ├─> NotesService.create()
   │   │   └─> Write to notes_write_db.note
   │   └─> EventBus.publish(new NoteCreatedEvent(id, title, content, categoryId))
   │
   ├─> NoteCreatedSyncHandler
   │   └─> Write to notes_read_db.note_read
   │
   └─> Return note to API Gateway

4. API Gateway
   └─> Return note to client

Response:
{
  "id": "uuid",
  "title": "Meeting Notes",
  "content": "Discuss project timeline",
  "categoryId": "uuid"
}
```

### Flow 4: Delete Category with Saga

```
┌─────────────────────────────────────────────────────────────────┐
│              DELETE CATEGORY WITH SAGA FLOW                      │
└─────────────────────────────────────────────────────────────────┘

1. HTTP Request
   DELETE http://localhost:3000/categories/:id

2. API Gateway
   ├─> CategoriesController.remove()
   │   └─> categoryClient.send('delete_category', id)
   └─> RabbitMQ: Message to category_queue

3. Category Service - Delete Category
   ├─> CategoriesController @MessagePattern('delete_category')
   │   └─> CommandBus.execute(new DeleteCategoryCommand(id))
   │
   ├─> DeleteCategoryHandler
   │   ├─> CategoriesService.remove()
   │   │   └─> Delete from category_write_db.category
   │   └─> EventBus.publish(new CategoryDeletedEvent(id))
   │
   ├─> CategoryDeletionSaga (listening for CategoryDeletedEvent)
   │   └─> Emits DeleteNotesByCategoryCommand(id)
   │
   ├─> DeleteNotesByCategoryHandler
   │   ├─> Creates RabbitMQ client to Notes Service
   │   └─> notesClient.send('delete_notes_by_category_id', id)
   │       └─> RabbitMQ: Message to notes_queue
   │
   ├─> CategoryDeletedHandler
   │   └─> Delete from category_read_db.category_read
   │
   └─> Return category to API Gateway

4. Notes Service - Delete Notes by Category
   ├─> NotesController @MessagePattern('delete_notes_by_category_id')
   │   └─> CommandBus.execute(new DeleteNotesByCategoryCommand(categoryId))
   │
   ├─> DeleteNotesByCategoryHandler
   │   ├─> NotesService.removeByCategoryId()
   │   │   └─> Delete from notes_write_db.note
   │   └─> EventBus.publish(new NotesDeletedByCategoryEvent(categoryId, count))
   │
   ├─> NotesDeletedByCategorySyncHandler
   │   └─> Delete from notes_read_db.note_read
   │
   └─> Return result to Category Service (via RabbitMQ)

5. Category Service
   └─> Receives result from Notes Service
       └─> Completes saga

6. API Gateway
   └─> Return deleted category to client

Response:
{
  "id": "uuid",
  "name": "Work",
  "description": "Work-related notes"
}
// All associated notes are also deleted
```

### Flow 5: Update Category

```
┌─────────────────────────────────────────────────────────────────┐
│                    UPDATE CATEGORY FLOW                          │
└─────────────────────────────────────────────────────────────────┘

1. HTTP Request
   PUT http://localhost:3000/categories/:id
   Body: { "name": "Personal", "description": "Personal notes" }

2. API Gateway
   ├─> CategoriesController.update()
   │   └─> categoryClient.send('update_category', { id, updateCategoryDto })
   └─> RabbitMQ: Message to category_queue

3. Category Service
   ├─> CategoriesController @MessagePattern('update_category')
   │   └─> CommandBus.execute(new UpdateCategoryCommand(id, name, description))
   │
   ├─> UpdateCategoryHandler
   │   ├─> CategoriesService.update()
   │   │   └─> Update category_write_db.category
   │   └─> EventBus.publish(new CategoryUpdatedEvent(id, name, description))
   │
   ├─> CategoryUpdatedSyncHandler
   │   ├─> Find in category_read_db.category_read
   │   ├─> Update fields
   │   └─> Save to category_read_db.category_read
   │
   └─> Return updated category to API Gateway

4. API Gateway
   └─> Return updated category to client

Response:
{
  "id": "uuid",
  "name": "Personal",
  "description": "Personal notes"
}
```

### Flow 6: Delete Note

```
┌─────────────────────────────────────────────────────────────────┐
│                      DELETE NOTE FLOW                            │
└─────────────────────────────────────────────────────────────────┘

1. HTTP Request
   DELETE http://localhost:3000/notes/:id

2. API Gateway
   ├─> NotesController.remove()
   │   └─> notesClient.send('delete_note', id)
   └─> RabbitMQ: Message to notes_queue

3. Notes Service
   ├─> NotesController @MessagePattern('delete_note')
   │   └─> CommandBus.execute(new DeleteNoteCommand(id))
   │
   ├─> DeleteNoteHandler
   │   ├─> NotesService.remove()
   │   │   └─> Delete from notes_write_db.note
   │   └─> EventBus.publish(new NoteDeletedEvent(id))
   │
   ├─> NoteDeletedSyncHandler
   │   └─> Delete from notes_read_db.note_read
   │
   └─> Return deleted note to API Gateway

4. API Gateway
   └─> Return deleted note to client

Response:
{
  "id": "uuid",
  "title": "Meeting Notes",
  "content": "Discuss project timeline",
  "categoryId": "uuid"
}
```

---

## Coordination Between Components

### How CQRS, Saga, RabbitMQ, and PostgreSQL Work Together

```
┌─────────────────────────────────────────────────────────────────┐
│         COMPONENT COORDINATION ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │   Client     │
                    └──────┬───────┘
                           │ HTTP
                    ┌──────▼───────┐
                    │ API Gateway  │
                    │ (NestJS)     │
                    └──────┬───────┘
                           │ RPC (AMQP)
                    ┌──────▼───────┐
                    │  RabbitMQ    │
                    │  Message     │
                    │  Broker      │
                    └──────┬───────┘
                           │ RPC
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼──────┐ ┌───▼────┐ ┌────▼─────┐
       │ Category    │ │ Notes  │ │ (Future  │
       │ Service     │ │Service │ │ Services)│
       │ (CQRS)      │ │ (CQRS) │ │          │
       └──────┬──────┘ └───┬────┘ └──────────┘
              │            │
              │ CQRS       │ CQRS
              │            │
    ┌─────────┼───────────┼──────────┐
    │         │           │          │
┌───▼───┐ ┌──▼───┐   ┌───▼───┐  ┌───▼───┐
│Command│ │Query │   │Command│  │Query  │
│Bus    │ │Bus   │   │Bus    │  │Bus    │
└───┬───┘ └──┬───┘   └───┬───┘  └───┬───┘
    │        │           │          │
┌───▼───┐ ┌──▼───┐   ┌───▼───┐  ┌───▼───┐
│Event  │ │Read  │   │Event  │  │Read   │
│Bus    │ │Model │   │Bus    │  │Model  │
└───┬───┘ └──┬───┘   └───┬───┘  └───┬───┘
    │        │           │          │
┌───▼───┐ ┌──▼───┐   ┌───▼───┐  ┌───▼───┐
│Saga   │ │Read  │   │       │  │Read   │
│       │ │DB    │   │       │  │DB     │
└───┬───┘ └──┬───┘   └───┬───┘  └───┬───┘
    │        │           │          │
    │        │      ┌────▼─────┐    │
    │        │      │Write     │    │
    │        │      │DB        │    │
    │        │      │(PG)      │    │
    │        │      └──────────┘    │
    │        │                      │
    │        │   ┌──────────────┐   │
    │        └───│ PostgreSQL    │◄──┘
    │            │ 4 Databases   │
    └────────────│ - Write DBs  │
                 │ - Read DBs    │
                 └──────────────┘
```

### Detailed Coordination Flow

#### 1. Request Entry (API Gateway + RabbitMQ)

```
Client → HTTP → API Gateway → ClientProxy → RabbitMQ → Microservice
```

- API Gateway receives HTTP request
- Uses NestJS ClientProxy to send RPC message
- RabbitMQ routes message to appropriate service queue
- Microservice receives message via @MessagePattern decorator

#### 2. Command Execution (CQRS Command Side)

```
Microservice → CommandBus → CommandHandler → Service → Write DB → EventBus
```

- Microservice controller receives message
- Delegates to CommandBus
- CommandBus routes to appropriate CommandHandler
- CommandHandler executes business logic via Service
- Service persists to Write PostgreSQL database
- CommandHandler publishes event via EventBus

#### 3. Event Synchronization (CQRS Event Side)

```
EventBus → Event → EventHandler → Read DB
```

- EventBus publishes event
- EventHandlers subscribe to specific events
- EventHandler updates Read PostgreSQL database
- Ensures eventual consistency between write and read DBs

#### 4. Query Execution (CQRS Query Side)

```
Microservice → QueryBus → QueryHandler → Read DB → Response
```

- Microservice controller receives query message
- Delegates to QueryBus
- QueryBus routes to appropriate QueryHandler
- QueryHandler queries Read PostgreSQL database
- Returns optimized read results

#### 5. Saga Orchestration (Saga Pattern)

```
Event → Saga → Command → Cross-Service RPC → Another Service
```

- Event is published (e.g., CategoryDeletedEvent)
- Saga listens for specific event types
- Saga emits new command (e.g., DeleteNotesByCategoryCommand)
- CommandHandler makes RPC call to another service via RabbitMQ
- Receiving service executes command and publishes response
- Saga can chain multiple steps for complex transactions

#### 6. Database Coordination (PostgreSQL)

```
Write Operations → Write DB → Event → Read DB
Read Operations → Read DB (direct)
```

- Write operations always go to Write database
- Events trigger synchronization to Read database
- Read operations query Read database only
- Complete separation ensures optimization for each use case

### Key Coordination Points

1. **RabbitMQ as Communication Backbone**
   - All inter-service communication flows through RabbitMQ
   - Enables asynchronous, reliable message delivery
   - Provides queue durability and message acknowledgment

2. **EventBus as Internal Event Dispatcher**
   - Internal to each service
   - Coordinates command handlers with event handlers
   - Enables eventual consistency within service

3. **Saga as Cross-Service Orchestrator**
   - Listens to events from EventBus
   - Emits commands that trigger cross-service RPC calls
   - Manages distributed transactions without 2PC

4. **PostgreSQL as Persistent Storage**
   - Four separate databases for complete CQRS separation
   - Write databases for command side
   - Read databases for query side
   - Event synchronization keeps them in sync

### Data Consistency Model

The system implements **Eventual Consistency**:

1. **Strong Consistency within Service**
   - Write DB update → Event publish → Read DB update happens synchronously
   - Within a single service, read model is updated immediately

2. **Eventual Consistency across Services**
   - Cross-service operations via Saga are asynchronous
   - Category deletion triggers notes deletion via RPC
   - Services may be briefly inconsistent during saga execution

3. **Compensating Actions**
   - If a saga step fails, the system would need compensating transactions
   - Current implementation uses synchronous RPC for simplicity
   - Could be enhanced with async messaging and compensation

### Error Handling and Reliability

1. **RabbitMQ Message Acknowledgment**
   - `noAck: false` ensures manual acknowledgment
   - Messages are re-queued if not acknowledged
   - Prevents message loss on service failure

2. **Database Transactions**
   - Each command handler executes within a transaction
   - Failed operations are rolled back
   - Events are only published on successful commit

3. **RPC Timeouts**
   - Cross-service RPC calls use `firstValueFrom` with observable
   - Can be enhanced with timeout configuration
   - Prevents hanging on unresponsive services

---

## Summary

### Architecture Highlights

1. **Microservices Architecture**
   - Three independent services (API Gateway, Category, Notes)
   - Each service can be deployed and scaled independently
   - Loose coupling via RabbitMQ messaging

2. **CQRS Pattern**
   - Complete separation of read and write operations
   - Separate databases for read and write
   - Event-driven synchronization
   - Optimized for both write and read performance

3. **Saga Pattern**
   - Manages cross-service transactions
   - Event-driven orchestration
   - Category deletion cascades to notes deletion
   - Avoids distributed two-phase commit

4. **Event-Driven Architecture**
   - Events drive read model synchronization
   - Events trigger saga orchestration
   - Loose coupling between components
   - Extensible for future features

5. **RabbitMQ Integration**
   - Central message broker for all communication
   - Request-Reply pattern for RPC
   - Durable queues for reliability
   - Manual acknowledgment for message safety

6. **PostgreSQL Database Strategy**
   - Four separate databases for complete separation
   - Write databases for command operations
   - Read databases for query operations
   - Event synchronization keeps data consistent

### Benefits

1. **Scalability** - Each service and database can scale independently
2. **Performance** - Read and write operations are optimized separately
3. **Maintainability** - Clear separation of concerns
4. **Reliability** - Message queuing ensures no lost requests
5. **Flexibility** - Easy to add new services or modify existing ones
6. **Observability** - Event-driven architecture provides good tracing

### Trade-offs

1. **Complexity** - More complex than monolithic architecture
2. **Eventual Consistency** - Cross-service operations are not immediately consistent
3. **Infrastructure** - Requires multiple databases and RabbitMQ
4. **Development Overhead** - More components to develop and maintain

### Future Enhancements

1. **Compensating Transactions** - Add rollback logic for failed saga steps
2. **Async Messaging** - Use fire-and-forget for non-critical operations
3. **Read Model Optimization** - Add denormalization, indexes, materialized views
4. **Event Sourcing** - Store all events for complete audit trail
5. **Caching** - Add Redis cache for frequently accessed read data
6. **Monitoring** - Add distributed tracing (Jaeger, Zipkin)
7. **Circuit Breakers** - Add resilience patterns for cross-service calls

---

## Conclusion

This Notes Manager application demonstrates a sophisticated microservices architecture implementing industry-standard patterns:
- **CQRS** for separating read and write concerns
- **Saga** for managing distributed transactions
- **Event-Driven Architecture** for loose coupling
- **RabbitMQ** for reliable message-based communication
- **PostgreSQL** for persistent storage with complete separation

The architecture provides a solid foundation for building scalable, maintainable, and reliable distributed systems. Each component has a clear responsibility, and the coordination between them follows established patterns that ensure data consistency and system reliability.
