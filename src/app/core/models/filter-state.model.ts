import { Priority } from './priority.enum';
import { Category } from './category.enum';

export type StatusFilter = 'ALL' | 'ACTIVE' | 'COMPLETED';
export type SortOption = 'ORDER' | 'PRIORITY' | 'DURATION' | 'TITLE';

export interface FilterState {
  searchQuery: string;
  status: StatusFilter;
  priorities: Priority[];
  categories: Category[];
  sortBy: SortOption;
  sortAscending: boolean;
}

export const INITIAL_FILTER_STATE: FilterState = {
  searchQuery: '',
  status: 'ALL',
  priorities: [],
  categories: [],
  sortBy: 'ORDER',
  sortAscending: true
};
