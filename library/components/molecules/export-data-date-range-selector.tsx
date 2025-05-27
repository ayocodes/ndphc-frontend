import * as React from "react"
import { addDays, format, subDays, subMonths, subYears } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/library/utils"
import { Button } from "@/library/components/atoms/button"
import { Calendar } from "@/library/components/atoms/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/library/components/atoms/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/library/components/atoms/select"
import { ExportDateRangeOption, EXPORT_DATE_RANGE_OPTIONS } from "@/library/types/plant-detail"

interface ExportDateRangeSelectorProps {
  onRangeChange: (range: { from: Date; to: Date }) => void;
  className?: string;
}

export function ExportDateRangeSelector({
  onRangeChange,
  className,
}: ExportDateRangeSelectorProps) {
  const [selectedOption, setSelectedOption] = React.useState<ExportDateRangeOption>('all')
  const [customDateRange, setCustomDateRange] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  })

  const handleOptionChange = (value: string) => {
    const option = value as ExportDateRangeOption
    setSelectedOption(option)

    const today = new Date()
    let from: Date
    let to = today

    switch (option) {
      case 'all':
        onRangeChange({ from: new Date(0), to: today })
        return
      case 'week':
        from = subDays(today, 7)
        break
      case 'month':
        from = subMonths(today, 1)
        break
      case '3month':
        from = subMonths(today, 3)
        break
      case '6month':
        from = subMonths(today, 6)
        break
      case 'year':
        from = subYears(today, 1)
        break
      case 'custom':
        if (customDateRange?.from && customDateRange.to) {
          from = customDateRange.from
          to = customDateRange.to
        } else {
          from = subDays(today, 7)
        }
        break
      default:
        from = subDays(today, 7)
    }

    onRangeChange({ from, to })
  }

  const handleCustomRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range.to) {
      setCustomDateRange(range)
      onRangeChange({ from: range.from, to: range.to })
    }
  }

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <Select value={selectedOption} onValueChange={handleOptionChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          {EXPORT_DATE_RANGE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedOption === 'custom' && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !customDateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {customDateRange?.from ? (
                customDateRange.to ? (
                  <>
                    {format(customDateRange.from, "LLL dd, y")} -{" "}
                    {format(customDateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(customDateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={customDateRange?.from}
              selected={customDateRange}
              onSelect={handleCustomRangeChange}
              numberOfMonths={2}
              disabled={(date) => date > new Date()}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
} 