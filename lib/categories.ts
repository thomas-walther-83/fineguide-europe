/**
 * Canonical violation categories. These are the keys that line up the same
 * violation across countries (used by the comparison table) and map to
 * translation keys `categories.<id>`.
 */
export type CategoryId =
  | 'speeding'
  | 'redlight'
  | 'phone'
  | 'parking'
  | 'alcohol'
  | 'seatbelt';

export type Category = {
  id: CategoryId;
  icon: string;
};

export const CATEGORIES: Category[] = [
  { id: 'speeding', icon: '🚗' },
  { id: 'redlight', icon: '🚦' },
  { id: 'phone', icon: '📱' },
  { id: 'parking', icon: '🅿️' },
  { id: 'alcohol', icon: '🍷' },
  { id: 'seatbelt', icon: '💺' },
];

export function categoryIcon(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.icon ?? '⚠️';
}
