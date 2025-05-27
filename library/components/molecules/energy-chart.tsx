import React from 'react';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Line,
  LineChart,
} from 'recharts';
import { format } from 'date-fns';
import { DailyData } from '@/library/types/plant-detail';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/library/components/atoms/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/library/components/atoms/card';

interface EnergyChartProps {
  data: DailyData[];
  title: string;
}

const chartConfig = {
  energy_generated: {
    label: "Energy Generated",
    color: "var(--color-chart-1)",
  },
  energy_exported: {
    label: "Energy Exported",
    color: "var(--color-chart-2)",
  },
  energy_consumed: {
    label: "Energy Consumed",
    color: "var(--color-chart-3)",
  },
};

export function EnergyChart({ data, title }: EnergyChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    date: item.date,
  }));

  // Determine if we should use a line chart based on the number of data points
  const useLineChart = data.length > 31; // Switch to line chart if more than a month of data

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer
          config={chartConfig}
          className="aspect-[2/1] h-[400px]"
        >
          {useLineChart ? (
            <LineChart
              data={formattedData}
              margin={{
                left: 48,
                right: 48,
                top: 32,
                bottom: 32,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  return format(new Date(value), 'MMM dd');
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickMargin={12}
                tickFormatter={(value) => `${value} MWH`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    nameKey="views"
                    labelFormatter={(value) => {
                      return format(new Date(value), 'MMM dd, yyyy');
                    }}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="energy_generated"
                stroke="var(--color-energy_generated)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="energy_exported"
                stroke="var(--color-energy_exported)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="energy_consumed"
                stroke="var(--color-energy_consumed)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          ) : (
            <BarChart
              data={formattedData}
              margin={{
                left: 48,
                right: 48,
                top: 32,
                bottom: 32,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  return format(new Date(value), 'MMM dd');
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickMargin={12}
                tickFormatter={(value) => `${value} MWH`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    nameKey="views"
                    labelFormatter={(value) => {
                      return format(new Date(value), 'MMM dd, yyyy');
                    }}
                  />
                }
              />
              <Bar
                dataKey="energy_generated"
                fill="var(--color-energy_generated)"
              />
              <Bar
                dataKey="energy_exported"
                fill="var(--color-energy_exported)"
              />
              <Bar
                dataKey="energy_consumed"
                fill="var(--color-energy_consumed)"
              />
            </BarChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
} 