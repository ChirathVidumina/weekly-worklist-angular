export enum Priority {
  URGENT = 'URGENT',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export interface PriorityMeta {
  key: Priority;
  label: string;
  weight: number;
  color: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
}

export const PRIORITY_METADATA: Record<Priority, PriorityMeta> = {
  [Priority.URGENT]: {
    key: Priority.URGENT,
    label: 'Urgent',
    weight: 4,
    color: '#ef4444',
    badgeBg: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    badgeText: 'text-rose-500',
    borderClass: 'border-l-rose-500'
  },
  [Priority.HIGH]: {
    key: Priority.HIGH,
    label: 'High',
    weight: 3,
    color: '#f97316',
    badgeBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    badgeText: 'text-amber-500',
    borderClass: 'border-l-amber-500'
  },
  [Priority.MEDIUM]: {
    key: Priority.MEDIUM,
    label: 'Medium',
    weight: 2,
    color: '#3b82f6',
    badgeBg: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    badgeText: 'text-blue-500',
    borderClass: 'border-l-blue-500'
  },
  [Priority.LOW]: {
    key: Priority.LOW,
    label: 'Low',
    weight: 1,
    color: '#64748b',
    badgeBg: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    badgeText: 'text-slate-400',
    borderClass: 'border-l-slate-400'
  }
};
