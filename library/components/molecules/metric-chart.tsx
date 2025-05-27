import React from "react";
import {
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  TooltipProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../atoms/card";
import { ChartConfig, DailyData } from "@/library/types/plant-detail";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "../atoms/chart";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../atoms/select";

export type ChartTypeOption = "bar" | "line";

interface MetricChartProps {
  data: DailyData[];
  config: ChartConfig;
  className?: string;
  isStacked?: boolean;
  chartType?: ChartTypeOption;
  onChartTypeChange?: (type: ChartTypeOption) => void;
}

// Custom tooltip content for better color representation
const CustomTooltipContent = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const date = new Date(label).toLocaleDateString();

    return (
      <div className="bg-white p-2 border border-slate-200 shadow-md rounded">
        <p className="font-medium text-gray-800 mb-2">{date}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <div
                className="w-2 h-2 rounded-[1px] mr-2"
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.name}:</span>
            </div>
            <span className="font-medium ml-4">
              {typeof entry.value === 'number'
                ? entry.value.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2
                })
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function MetricChart({
  data,
  config,
  className,
  isStacked = false,
  chartType = "bar",
  onChartTypeChange,
}: MetricChartProps) {
  // Auto-use line charts for data over 31 days unless specifically set to 'bar'
  const shouldUseLine =
    (data.length > 31 && chartType !== "bar") || chartType === "line";
  const hasMultipleMetrics = config.metrics.length > 1;

  // Check if this is Energy Generated vs Exported chart
  const isEnergyChart = config.title === "Energy Generated vs Exported";

  // Create chart configuration for the metrics
  const chartConfig = config.metrics.reduce((acc, metric) => {
    return {
      ...acc,
      [metric.key]: {
        label: metric.label,
        theme: {
          light: metric.color,
          dark: metric.color,
        },
      },
    };
  }, {});

  // Function to format date labels for better visibility
  const formatDateLabel = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      // Use shorter format if there are many data points
      if (data.length > 10) {
        return format(date, "MM/dd");
      }
      return format(date, "MMM dd");
    } catch (e) {
      return dateStr;
    }
  };

  // Function to handle chart type change
  const handleChartTypeChange = (value: string) => {
    if (onChartTypeChange && (value === "bar" || value === "line")) {
      onChartTypeChange(value);
    }
  };

  // Determine chart type selector visibility
  const showChartTypeSelector = onChartTypeChange !== undefined;

  // Stacked charts (e.g., Losses)
  if (isStacked) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="card-title">
              {config.title} ({config.unit})
            </CardTitle>
            {config.description && (
              <p className="text-sm text-muted-foreground">
                {config.description}
              </p>
            )}
          </div>
          {showChartTypeSelector && (
            <Select value={chartType} onValueChange={handleChartTypeChange}>
              <SelectTrigger className="w-[110px] h-8">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar" className="flex items-center">
                  <span>Bar</span>
                </SelectItem>
                <SelectItem value="line" className="flex items-center">
                  <span>Line</span>
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </CardHeader>
        <CardContent>
          <div className="h-[300px] chart-container">
            <ChartContainer config={chartConfig}>
              {shouldUseLine ? (
                <ComposedChart
                  data={data}
                  margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDateLabel}
                    interval="preserveStartEnd"
                    tickMargin={10}
                  />
                  <YAxis
                    label={{
                      value: config.unit,
                      angle: -90,
                      position: "insideLeft",
                      offset: 10,
                    }}
                  />
                  <Tooltip content={CustomTooltipContent} />
                  <ChartLegend content={<ChartLegendContent />} />
                  {config.metrics.map((metric, index) => (
                    <Line
                      key={metric.key}
                      type="monotone"
                      dataKey={metric.key}
                      name={metric.label}
                      stroke={metric.color}
                      strokeWidth={1.5}
                      dot={{
                        fill: metric.color,
                        r: 3,
                      }}
                      activeDot={{
                        r: 5,
                        stroke: metric.color,
                        strokeWidth: 1,
                      }}
                      // Add dash pattern for metrics after the first one
                      strokeDasharray={index > 0 ? "5 5" : undefined}
                    />
                  ))}
                </ComposedChart>
              ) : (
                <BarChart data={data}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDateLabel}
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis
                    label={{
                      value: config.unit,
                      angle: -90,
                      position: "insideLeft",
                      offset: 10,
                    }}
                  />
                  <Tooltip content={CustomTooltipContent} />
                  <ChartLegend content={<ChartLegendContent />} />
                  {config.metrics.map((metric, index) => (
                    <Bar
                      key={metric.key}
                      dataKey={metric.key}
                      name={metric.label}
                      fill={metric.color}
                      stackId="a"
                      radius={
                        index === 0
                          ? [0, 0, 4, 4]
                          : index === config.metrics.length - 1
                            ? [4, 4, 0, 0]
                            : 0
                      }
                    />
                  ))}
                </BarChart>
              )}
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Non-stacked charts (regular charts, including Energy Generated vs Exported)
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="card-title">
            {config.title} ({config.unit})
          </CardTitle>
          {config.description && (
            <p className="text-sm text-muted-foreground">
              {config.description}
            </p>
          )}
        </div>
        {showChartTypeSelector && (
          <Select value={chartType} onValueChange={handleChartTypeChange}>
            <SelectTrigger className="w-[110px] h-8">
              <SelectValue placeholder="Chart Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar" className="flex items-center">
                <span>Bar</span>
              </SelectItem>
              <SelectItem value="line" className="flex items-center">
                <span>Line</span>
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-[300px] chart-container">
          <ChartContainer config={chartConfig}>
            <ComposedChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDateLabel}
                interval="preserveStartEnd"
                tickMargin={10}
              />
              <YAxis
                label={{
                  value: config.unit,
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                }}
              />
              <Tooltip content={CustomTooltipContent} />
              {/* Only show legend if there are multiple metrics */}
              {hasMultipleMetrics && (
                <ChartLegend
                  content={<ChartLegendContent />}
                  verticalAlign="top"
                  height={36}
                />
              )}
              {config.metrics.map((metric, index) =>
                shouldUseLine ? (
                  <Line
                    key={metric.key}
                    type="monotone"
                    dataKey={metric.key}
                    name={metric.label}
                    stroke={metric.color}
                    strokeWidth={1.5}
                    dot={{
                      fill: metric.color,
                      r: 3,
                    }}
                    activeDot={{
                      r: 5,
                      stroke: metric.color,
                      strokeWidth: 1,
                    }}
                    // For Energy Chart, add different line styles for visual distinction
                    strokeDasharray={isEnergyChart && index > 0 ? "5 5" : undefined}
                  />
                ) : (
                  <Bar
                    key={metric.key}
                    dataKey={metric.key}
                    name={metric.label}
                    fill={metric.color}
                    radius={[4, 4, 0, 0]}
                  />
                )
              )}
            </ComposedChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}