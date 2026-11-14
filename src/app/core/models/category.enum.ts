export enum Category {
  ENGINEERING = 'ENGINEERING',
  DESIGN = 'DESIGN',
  PRODUCT = 'PRODUCT',
  OPERATIONS = 'OPERATIONS',
  MEETINGS = 'MEETINGS',
  PERSONAL = 'PERSONAL'
}

export interface CategoryMeta {
  key: Category;
  label: string;
  badgeBg: string;
  dotColor: string;
}

export const CATEGORY_METADATA: Record<Category, CategoryMeta> = {
  [Category.ENGINEERING]: {
    key: Category.ENGINEERING,
    label: 'Engineering',
    badgeBg: 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border-indigo-500/20',
    dotColor: '#6366f1'
  },
  [Category.DESIGN]: {
    key: Category.DESIGN,
    label: 'Design',
    badgeBg: 'bg-fuchsia-500/10 text-fuchsia-500 dark:text-fuchsia-400 border-fuchsia-500/20',
    dotColor: '#d946ef'
  },
  [Category.PRODUCT]: {
    key: Category.PRODUCT,
    label: 'Product',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    dotColor: '#10b981'
  },
  [Category.OPERATIONS]: {
    key: Category.OPERATIONS,
    label: 'Operations',
    badgeBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    dotColor: '#06b6d4'
  },
  [Category.MEETINGS]: {
    key: Category.MEETINGS,
    label: 'Meetings',
    badgeBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    dotColor: '#8b5cf6'
  },
  [Category.PERSONAL]: {
    key: Category.PERSONAL,
    label: 'Personal',
    badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    dotColor: '#f43f5e'
  }
};
