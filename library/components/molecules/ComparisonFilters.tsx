import React from 'react';
import { DateRangeSelector } from '@/library/components/molecules/date-range-selector';
import { Checkbox } from '@/library/components/atoms/checkbox';
import { Button } from '@/library/components/atoms/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/library/components/atoms/popover';
import { ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/library/components/atoms/command';
import { PowerPlantResponse } from '@/library/types/dashboard';
import { DownloadReportButton } from '@/library/components/molecules/download-report-button';

interface MetricOption {
  key: string;
  label: string;
  unit: string;
}

interface ComparisonFiltersProps {
  metrics: MetricOption[];
  selectedMetrics: string[];
  powerPlants: PowerPlantResponse[];
  selectedPlants: number[];
  metricsOpen: boolean;
  plantsOpen: boolean;
  setMetricsOpen: (open: boolean) => void;
  setPlantsOpen: (open: boolean) => void;
  handleMetricToggle: (metricKey: string) => void;
  handlePlantToggle: (plantId: number) => void;
  toggleAllMetrics: () => void;
  toggleAllPlants: () => void;
  handleDateRangeChange: (range: { from: Date; to: Date }) => void;
}

export const ComparisonFilters = ({
  metrics,
  selectedMetrics,
  powerPlants,
  selectedPlants,
  metricsOpen,
  plantsOpen,
  setMetricsOpen,
  setPlantsOpen,
  handleMetricToggle,
  handlePlantToggle,
  toggleAllMetrics,
  toggleAllPlants,
  handleDateRangeChange
}: ComparisonFiltersProps) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Metrics:</label>
          <Popover open={metricsOpen} onOpenChange={setMetricsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={metricsOpen}
                className="w-[280px] justify-between"
              >
                {selectedMetrics.length === 0
                  ? "Select metrics..."
                  : selectedMetrics.length === 1
                    ? metrics.find(m => m.key === selectedMetrics[0])?.label || `${selectedMetrics.length} selected`
                    : `${selectedMetrics.length} metric(s) selected`}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0 border border-slate-200">
              <Command>
                <CommandInput placeholder="Search metrics..." />
                <CommandEmpty>No metric found.</CommandEmpty>
                <CommandGroup className="max-h-60 overflow-y-auto">
                  <CommandItem onSelect={toggleAllMetrics} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedMetrics.length === metrics.length && metrics.length > 0}
                        className="mr-2"
                      />
                      <span>Select All</span>
                    </div>
                  </CommandItem>
                  {metrics.map((metric) => (
                    <CommandItem
                      key={metric.key}
                      value={metric.label}
                      onSelect={() => handleMetricToggle(metric.key)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedMetrics.includes(metric.key)}
                          className="mr-2"
                        />
                        <span>{metric.label}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Power Plants:</label>
          <Popover open={plantsOpen} onOpenChange={setPlantsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={plantsOpen}
                className="w-[280px] justify-between"
              >
                {selectedPlants.length === 0
                  ? "Select plants..."
                  : selectedPlants.length === 1
                    ? powerPlants.find(p => p.id === selectedPlants[0])?.name || `${selectedPlants.length} selected`
                    : `${selectedPlants.length} plant(s) selected`}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0 border border-slate-200">
              <Command>
                <CommandInput placeholder="Search power plants..." />
                <CommandEmpty>No power plant found.</CommandEmpty>
                <CommandGroup className="max-h-60 overflow-y-auto">
                  <CommandItem onSelect={toggleAllPlants} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedPlants.length === powerPlants.length && powerPlants.length > 0}
                        className="mr-2"
                      />
                      <span>Select All</span>
                    </div>
                  </CommandItem>
                  {powerPlants.map((plant) => (
                    <CommandItem
                      key={plant.id}
                      value={plant.name}
                      onSelect={() => handlePlantToggle(plant.id)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedPlants.includes(plant.id)}
                          className="mr-2"
                        />
                        <span>{plant.name}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <DateRangeSelector onRangeChange={handleDateRangeChange} />
      </div>
      
      {/* Download Button with proper spacing */}
      <div className="ml-auto">
        <DownloadReportButton />
      </div>
    </div>
  );
};