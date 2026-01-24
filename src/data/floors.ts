import { Floor, Table } from '@/types/pos';

const createTables = (floorId: string, count: number): Table[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${floorId}-table-${i + 1}`,
    number: i + 1,
    seats: [2, 4, 4, 6, 4, 2, 4, 6][i % 8],
    status: ['free', 'free', 'occupied', 'free', 'pending', 'free', 'occupied', 'free'][i % 8] as Table['status'],
    floor: floorId,
  }));
};

export const floors: Floor[] = [
  {
    id: 'ground',
    name: 'Ground Floor',
    tables: createTables('ground', 12),
  },
  {
    id: 'first',
    name: 'First Floor',
    tables: createTables('first', 8),
  },
  {
    id: 'terrace',
    name: 'Terrace',
    tables: createTables('terrace', 6),
  },
];
