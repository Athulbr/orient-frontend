import { TablebuilderStateIF } from '../interface';

export const tablebuilderInitialState: TablebuilderStateIF = {
  data: [],
  selectedIds: [],
  loading: false,
  total: 0,
  page: 1,
  pageRows: 20,
  activeFilters: [],
  startDate: null,
  endDate: null,
  searchValue: '',
  sorts: [],
  skipActiveFilters: false,
};
