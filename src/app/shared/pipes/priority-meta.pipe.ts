import { Pipe, PipeTransform } from '@angular/core';
import { Priority, PRIORITY_METADATA, PriorityMeta } from '../../core/models/priority.enum';

@Pipe({
  name: 'priorityMeta',
  standalone: true
})
export class PriorityMetaPipe implements PipeTransform {
  transform(priority: Priority | null | undefined): PriorityMeta {
    if (!priority || !PRIORITY_METADATA[priority]) {
      return PRIORITY_METADATA[Priority.MEDIUM];
    }
    return PRIORITY_METADATA[priority];
  }
}
