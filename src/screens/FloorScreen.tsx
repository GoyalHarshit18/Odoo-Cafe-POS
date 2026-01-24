import { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import { TableCard } from '@/components/pos/TableCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Grid3X3, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export const FloorScreen = () => {
  const { floors, session, selectTable, setCurrentScreen, openSession } = usePOS();
  const [selectedFloor, setSelectedFloor] = useState(floors[0].id);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const currentFloor = floors.find((f) => f.id === selectedFloor)!;
  
  const filteredTables = statusFilter
    ? currentFloor.tables.filter((t) => t.status === statusFilter)
    : currentFloor.tables;

  const handleTableClick = (table: typeof currentFloor.tables[0]) => {
    if (!session) {
      openSession();
    }
    selectTable(table);
    setCurrentScreen('order');
  };

  const statusCounts = {
    free: currentFloor.tables.filter(t => t.status === 'free').length,
    occupied: currentFloor.tables.filter(t => t.status === 'occupied').length,
    pending: currentFloor.tables.filter(t => t.status === 'pending').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Grid3X3 className="w-7 h-7 text-primary" />
            Floor & Table View
          </h1>
          <p className="text-muted-foreground">Select a table to start an order</p>
        </div>
      </div>

      {/* Floor Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {floors.map((floor) => (
          <Button
            key={floor.id}
            variant={selectedFloor === floor.id ? 'default' : 'outline'}
            onClick={() => setSelectedFloor(floor.id)}
            className="whitespace-nowrap touch-btn"
          >
            {floor.name}
            <span className="ml-2 px-2 py-0.5 bg-primary-foreground/20 rounded text-xs">
              {floor.tables.length}
            </span>
          </Button>
        ))}
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>Filter:</span>
        </div>
        <button
          onClick={() => setStatusFilter(null)}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            !statusFilter ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'
          )}
        >
          All ({currentFloor.tables.length})
        </button>
        <button
          onClick={() => setStatusFilter('free')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            statusFilter === 'free' ? 'bg-status-free text-white' : 'bg-status-free-bg text-status-free hover:bg-status-free/20'
          )}
        >
          🟢 Available ({statusCounts.free})
        </button>
        <button
          onClick={() => setStatusFilter('occupied')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            statusFilter === 'occupied' ? 'bg-status-occupied text-white' : 'bg-status-occupied-bg text-status-occupied hover:bg-status-occupied/20'
          )}
        >
          🟡 Occupied ({statusCounts.occupied})
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            statusFilter === 'pending' ? 'bg-status-pending text-white' : 'bg-status-pending-bg text-status-pending hover:bg-status-pending/20'
          )}
        >
          🔴 Payment Due ({statusCounts.pending})
        </button>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredTables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            onClick={() => handleTableClick(table)}
          />
        ))}
      </div>

      {filteredTables.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Grid3X3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No tables match the selected filter</p>
        </div>
      )}

      {/* Legend */}
      <div className="pos-card p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Table Status Legend</h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-status-free" />
            <span className="text-sm">Available - Ready for guests</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-status-occupied" />
            <span className="text-sm">Occupied - Order in progress</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-status-pending" />
            <span className="text-sm">Payment Due - Awaiting payment</span>
          </div>
        </div>
      </div>
    </div>
  );
};
