import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from '@/lib/date-fns';

interface CalendarProps {
  selected?: Date;
  onSelect: (date: Date) => void;
  mode?: 'single';
  initialFocus?: boolean;
}

export function Calendar({ selected, onSelect, mode = 'single', initialFocus }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(selected || new Date());

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className="p-3">
      <div className="flex justify-between items-center mb-4">
        <Button onClick={handlePrevMonth} variant="outline" size="icon">
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <div>{format(currentMonth, 'MMMM yyyy')}</div>
        <Button onClick={handleNextMonth} variant="outline" size="icon">
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="text-center text-sm font-medium">
            {day}
          </div>
        ))}
        {days.map((day) => (
          <Button
            key={day.toString()}
            onClick={() => onSelect(day)}
            variant={isSameDay(day, selected!) ? 'default' : 'ghost'}
            className={`${
              !isSameMonth(day, currentMonth) ? 'text-gray-400' : ''
            } h-8 w-8 p-0 font-normal`}
          >
            {format(day, 'd')}
          </Button>
        ))}
      </div>
    </div>
  );
}