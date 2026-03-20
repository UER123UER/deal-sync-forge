import { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckSquare, Calendar as CalIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTasks } from '@/hooks/useTasks';
import { useOpenHouses } from '@/hooks/useOpenHouses';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isSameMonth } from 'date-fns';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { data: tasks = [] } = useTasks();
  const { data: openHouses = [] } = useOpenHouses();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart);

  const getEventsForDay = (day: Date) => {
    const items: { label: string; type: 'task' | 'openhouse' }[] = [];
    tasks.forEach((t) => {
      if (t.due_date && isSameDay(new Date(t.due_date), day)) {
        items.push({ label: t.title, type: 'task' });
      }
    });
    openHouses.forEach((oh) => {
      if (isSameDay(new Date(oh.scheduled_date + 'T00:00:00'), day)) {
        items.push({ label: `Open House ${oh.start_time}`, type: 'openhouse' });
      }
    });
    return items;
  };

  const today = new Date();

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-14 border-b flex items-center px-6 gap-4">
        <h1 className="text-lg font-semibold text-foreground">Calendar</h1>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft className="w-4 h-4" /></Button>
          <span className="text-sm font-medium text-foreground w-40 text-center">{format(currentMonth, 'MMMM yyyy')}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="bg-muted px-2 py-2 text-xs font-medium text-muted-foreground text-center">{d}</div>
          ))}
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} className="bg-background min-h-[100px]" />
          ))}
          {days.map((day) => {
            const events = getEventsForDay(day);
            const isToday = isSameDay(day, today);
            return (
              <div key={day.toISOString()} className={cn('bg-background min-h-[100px] p-1.5 border-t', isToday && 'bg-primary/5')}>
                <div className={cn('text-xs font-medium mb-1', isToday ? 'text-primary' : 'text-foreground')}>{format(day, 'd')}</div>
                <div className="space-y-0.5">
                  {events.slice(0, 3).map((ev, i) => (
                    <div key={i} className={cn('text-[10px] leading-tight px-1 py-0.5 rounded truncate', ev.type === 'task' ? 'bg-primary/10 text-primary' : 'bg-accent text-accent-foreground')}>
                      {ev.label}
                    </div>
                  ))}
                  {events.length > 3 && <div className="text-[10px] text-muted-foreground px-1">+{events.length - 3} more</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
