export interface CategoryItem {
  id: string;
  name: string;
  color: string; // Hex color code
  isDefault?: boolean;
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'cat-work', name: 'Work', color: '#3B82F6', isDefault: true },
  { id: 'cat-study', name: 'Study', color: '#8B5CF6', isDefault: true },
  { id: 'cat-personal', name: 'Personal', color: '#10B981', isDefault: true },
  { id: 'cat-urgent', name: 'Urgent', color: '#EF4444', isDefault: true }
];

export const UNCATEGORIZED_CATEGORY: CategoryItem = {
  id: 'uncategorized',
  name: 'Uncategorized',
  color: '#64748B',
  isDefault: true
};

export const PRESET_CATEGORY_COLORS: Array<{ name: string; hex: string }> = [
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Purple', hex: '#8B5CF6' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Rose', hex: '#EF4444' },
  { name: 'Amber', hex: '#F59E0B' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Cyan', hex: '#06B6D4' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Indigo', hex: '#6366F1' },
  { name: 'Slate', hex: '#64748B' }
];
