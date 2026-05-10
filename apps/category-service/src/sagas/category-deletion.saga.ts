import { Saga, ofType } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CategoryDeletedEvent } from '../events/category-deleted.event';
import { Injectable, Logger } from '@nestjs/common';
import { DeleteNotesByCategoryCommand } from '../commands/delete-notes-by-category.command';

@Injectable()
export class CategoryDeletionSaga {
  private readonly logger = new Logger(CategoryDeletionSaga.name);

  @Saga()
  categoryDeleted = (events$: Observable<any>): Observable<DeleteNotesByCategoryCommand> => {
    return events$.pipe(
      ofType(CategoryDeletedEvent),
      map((event) => {
        this.logger.log(`Saga: Processing category deletion for ${event.categoryId}`);
        return new DeleteNotesByCategoryCommand(event.categoryId);
      }),
    );
  };
}
