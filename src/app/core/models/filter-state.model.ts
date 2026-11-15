import { Priority } from './priority.enum';

export type StatusFilter = 'ALL' | 'ACTIVE' | 'COMPLETED';
export type SortOption = 'ORDER' | 'PRIORITY' | 'DURATION' | 'TITLE';

export interface FilterState {
  searchQuery: string;
  status: StatusFilter;
  priorities: Priority[];
  categories: string[]; // Dynamic Category IDs
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
