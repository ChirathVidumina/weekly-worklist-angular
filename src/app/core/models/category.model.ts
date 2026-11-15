export interface CategoryItem {
  id: string;
  name: string;
  color: string; // Hex color code
  isDefault?: boolean;
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: '6af93b61992b2b1b5e5310e9', name: 'Work', color: '#3B82F6', isDefault: true },
  { id: '6af93b61992b2b1b5e5310ea', name: 'Study', color: '#8B5CF6', isDefault: true },
  { id: '6af93b61992b2b1b5e5310eb', name: 'Personal', color: '#10B981', isDefault: true },
  { id: '6af93b61992b2b1b5e5310ec', name: 'Urgent', color: '#EF4444', isDefault: true }
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
