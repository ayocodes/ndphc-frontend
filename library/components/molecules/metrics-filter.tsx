import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/library/components/atoms/select"
import { Calendar } from "@/library/components/atoms/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/library/components/atoms/popover"
import { Button } from "@/library/components/atoms/button"
import { CalendarIcon, ChevronsUpDown } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/library/utils"
import { Checkbox } from "@/library/components/atoms/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/library/components/atoms/command"

interface PowerPlant {
  id: number;
  name: string;
}

interface MetricsFilterProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  selectedMetric: string;
  onMetricChange: (metric: string) => void;
  selectedPowerPlants: number[];
  onPowerPlantsChange: (ids: number[]) => void;
  powerPlants: PowerPlant[];
}

const OPERATIONAL_METRICS = [
  { value: "operating_hours", label: "Operating Hours" },
  { value: "operational_events", label: "Operational Events" },
  { value: "hourly_generation", label: "Hourly Generation" },
  { value: "morning_declarations", label: "Morning Declarations" },
];

export function MetricsFilter({
  selectedDate,
  onDateChange,
  selectedMetric,
  onMetricChange,
  selectedPowerPlants,
  onPowerPlantsChange,
  powerPlants,
}: MetricsFilterProps) {
  const [plantsOpen, setPlantsOpen] = useState(false);

  const handlePlantToggle = (plantId: number) => {
    if (selectedPowerPlants.includes(plantId)) {
      onPowerPlantsChange(selectedPowerPlants.filter((id) => id !== plantId));
    } else {
      onPowerPlantsChange([...selectedPowerPlants, plantId]);
    }
  };

  const toggleAllPlants = () => {
    if (selectedPowerPlants.length === powerPlants.length) {
      onPowerPlantsChange([]);
    } else {
      onPowerPlantsChange(powerPlants.map((p) => p.id));
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="metrics-date-picker" className="text-sm font-medium text-gray-700">Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="metrics-date-picker"
                variant={"outline"}
                className={cn(
                  "w-full md:w-[240px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && onDateChange(date)}
                initialFocus
                disabled={{ after: new Date() }}
                defaultMonth={selectedDate}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="metrics-metric-selector" className="text-sm font-medium text-gray-700">Metric</label>
          <Select value={selectedMetric} onValueChange={onMetricChange}>
            <SelectTrigger id="metrics-metric-selector" className="w-full md:w-[240px]">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              {OPERATIONAL_METRICS.map((metric) => (
                <SelectItem key={metric.value} value={metric.value}>
                  {metric.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="metrics-plant-selector" className="text-sm font-medium text-gray-700">Power Plants</label>
          <Popover open={plantsOpen} onOpenChange={setPlantsOpen}>
            <PopoverTrigger asChild>
              <Button
                id="metrics-plant-selector"
                variant="outline"
                role="combobox"
                aria-expanded={plantsOpen}
                className="w-full md:w-[300px] justify-between"
              >
                {selectedPowerPlants.length === 0
                  ? "Select plant(s)..."
                  : selectedPowerPlants.length === 1
                    ? powerPlants.find(p => p.id === selectedPowerPlants[0])?.name || `${selectedPowerPlants.length} selected`
                    : `${selectedPowerPlants.length} plant(s) selected`}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full md:w-[300px] p-0 border border-slate-200">
              <Command>
                <CommandInput placeholder="Search power plants..." />
                <CommandEmpty>No power plant found.</CommandEmpty>
                <CommandGroup className="max-h-60 overflow-y-auto">
                  <CommandItem onSelect={toggleAllPlants} className="cursor-pointer">
                    <Checkbox
                      id="metrics-select-all-plants"
                      checked={selectedPowerPlants.length === powerPlants.length && powerPlants.length > 0}
                      className="mr-2"
                    />
                    <span>Select All</span>
                  </CommandItem>
                  {powerPlants.map((plant) => (
                    <CommandItem
                      key={plant.id}
                      value={plant.name}
                      onSelect={() => handlePlantToggle(plant.id)}
                      className="cursor-pointer"
                    >
                      <Checkbox
                        id={`metrics-plant-${plant.id}`}
                        checked={selectedPowerPlants.includes(plant.id)}
                        className="mr-2"
                      />
                      <span>{plant.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}