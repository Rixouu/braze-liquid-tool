import React from 'react';
import { Input } from '@/components/ui/input';
import { Calendar } from "./Calendar";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';

interface SampleDataEditorProps {
  sampleData: Record<string, any>;
  onChange: (newData: Record<string, any>) => void;
}

const SampleDataEditor: React.FC<SampleDataEditorProps> = React.memo(({ sampleData, onChange }) => {
  const handleChange = React.useCallback((path: string[], value: any) => {
    const newData = JSON.parse(JSON.stringify(sampleData));
    let current = newData;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) current[path[i]] = {};
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    onChange(newData);
  }, [sampleData, onChange]);

  const renderEditor = (path: string[], value: any) => {
    if (typeof value === 'object' && value !== null) {
      return (
        <div className="pl-4">
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className="space-y-2">
              <label className="text-sm font-medium">{key}</label>
              {renderEditor([...path, key], val)}
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      // Date input
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value || <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={new Date(value)}
              onSelect={(date) => handleChange(path, format(date!, 'yyyy-MM-dd'))}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      );
    } else {
      // Default to text input
      return (
        <Input
          type="text"
          value={value}
          onChange={(e) => handleChange(path, e.target.value)}
        />
      );
    }
  };

  return (
    <div className="space-y-4">
      {Object.entries(sampleData).map(([key, value]) => (
        <div key={key} className="space-y-2">
          <label className="text-sm font-medium">{key}</label>
          {renderEditor([key], value)}
        </div>
      ))}
    </div>
  );
});

export default SampleDataEditor;