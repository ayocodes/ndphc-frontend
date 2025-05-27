// src/components/molecules/date-picker.tsx
"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/library/utils";
import { Button } from "@/library/components/atoms/button";
import { Calendar } from "@/library/components/atoms/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/library/components/atoms/popover";

interface DatePickerProps {
  selected?: Date;
  onSelect?: (date?: Date) => void;
  disabled?: boolean;
}

export function DatePicker({ selected, onSelect, disabled }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !selected && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={onSelect}
          initialFocus
          disabled={(date) =>
            date > new Date() || date < new Date("1900-01-01")
          }
        />
      </PopoverContent>
    </Popover>
  );
}
