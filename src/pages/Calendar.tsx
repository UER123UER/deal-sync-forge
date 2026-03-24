import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTasks, useCreateTask } from '@/hooks/useTasks';
import { useOpenHouses } from '@/hooks/useOpenHouses';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// US Federal Holidays (fixed dates; floating ones approximated for current year)
function getHolidays(year: number): { date: Date; name: string }[] {
  return [
    { date: new Date(year, 0, 1), name: "New Year's Day" },
    { date: getNthWeekday(year, 0, 1, 3), name: "MLK Jr. Day" },
    { date: getNthWeekday(year, 1, 1, 3), name: "Presidents' Day" },
    { date: getLastWeekday(year, 4, 1), name: "Memorial Day" },
    { date: new Date(year, 5, 19), name: "Juneteenth" },
    { date: new Date(year, 6, 4), name: "Independence Day" },
    { date: getNthWeekday(year, 8, 1, 1), name: "Labor Day" },
    { date: getNthWeekday(year, 9, 1, 2), name: "Columbus Day" },
    { date: new Date(year, 10, 11), name: "Veterans Day" },
    { date: getNthWeekday(year, 10, 4, 4), name: "Thanksgiving" },
    { date: new Date(year, 11, 25), name: "Christmas" },
  ];
}

function getNthWeekday(year: number, month: number, weekday: number, n: number): Date {
  const first = new Date(year, month, 1);
  let day = 1 + ((weekday - first.getDay() + 7) % 7);
  day += (n - 1) * 7;
  return new Date(year, month, day);
}

function getLastWeekday(year: number, month: number, weekday: number): Date {
  const last = new Date(year, month + 1, 0);
  const diff = (last.getDay() - weekday + 7) % 7;
  return new Date(year, month, last.getDate() - diff);
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { data: tasks = [] } = useTasks();
  const { data: openHouses = [] } = useOpenHouses();
  const createTask = useCreateTask();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [eventTitle, setEventTitle] = useState('');

  const year = currentMonth.getFullYear();
  const holidays = getHolidays(year);
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart);

  const getEventsForDay = (day: Date) => {
    const items: { label: string; type: 'task' | 'openhouse' | 'holiday' }[] = [];
    holidays.forEach((h) => {
      if (isSameDay(h.date, day)) items.push({ label: h.name, type: 'holiday' });
    });
    tasks.forEach((t) => {
      if (t.due_date && isSameDay(new Date(t.due_date), day)) items.push({ label: t.title, type: 'task' });
    });
    openHouses.forEach((oh) => {
      if (isSameDay(new Date(oh.scheduled_date + 'T00:00:00'), day)) items.push({ label: `Open House ${oh.start_time}`, type: 'openhouse' });
    });
    return items;
  };

  const today = new Date();

  const handleCreateEvent = async () => {
    if (!eventTitle.trim()) { toast.error('Title is required'); return; }
    if (!eventDate) { toast.error('Date is required'); return; }
    try {
      await createTask.mutateAsync({ title: eventTitle.trim(), type: 'todo', due_date: new Date(eventDate + 'T00:00:00').toISOString() });
      toast.success('Event added to calendar');
      setDialogOpen(false);
      setEventTitle('');
      setEventDate('');
    } catch { toast.error('Failed to create event'); }
  };

  const openNewEvent = (dateStr?: string) => {
    setEventDate(dateStr || format(new Date(), 'yyyy-MM-dd'));
    setEventTitle('');
    setDialogOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-14 border-b flex items-center px-6 gap-4">
        <h1 className="text-lg font-semibold text-foreground">Calendar</h1>
        <div className="flex-1" />
        <Button size="sm" className="text-xs gap-1.5" onClick={() => openNewEvent()}>
          <Plus className="w-3.5 h-3.5" /> New Event
        </Button>
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
            const dateStr = format(day, 'yyyy-MM-dd');
            return (
              <div
                key={day.toISOString()}
                className={cn('bg-background min-h-[100px] p-1.5 border-t cursor-pointer hover:bg-muted/30 transition-colors', isToday && 'bg-primary/5')}
                onClick={() => openNewEvent(dateStr)}
              >
                <div className={cn('text-xs font-medium mb-1', isToday ? 'text-primary' : 'text-foreground')}>{format(day, 'd')}</div>
                <div className="space-y-0.5">
                  {events.slice(0, 3).map((ev, i) => (
                    <div key={i} className={cn('text-[10px] leading-tight px-1 py-0.5 rounded truncate',
                      ev.type === 'holiday' ? 'bg-destructive/10 text-destructive' :
                      ev.type === 'task' ? 'bg-primary/10 text-primary' :
                      'bg-accent text-accent-foreground'
                    )}>
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

      {/* Create Event Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>New Event</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Title</Label>
              <Input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="Event title" className="mt-1" />
            </div>
            <div>
              <Label className="text-sm">Date</Label>
              <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="mt-1" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleCreateEvent} disabled={createTask.isPending}>
                {createTask.isPending ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
