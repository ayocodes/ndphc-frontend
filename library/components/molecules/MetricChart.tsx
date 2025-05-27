import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  LegendType,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { ChartContainer } from '@/library/components/atoms/chart';
import { CustomBar, LegendPayloadItem } from './CustomBar';
import { CustomTooltip } from './CustomTooltip';

interface MetricData {
  power_plant: string;
  value: number;
  percentage: number;
}

interface MetricConfig {
  key: string;
  label: string;
  unit: string;
}

interface MetricChartProps {
  metric: {
    name: string;
    unit: string;
    data: MetricData[];
  };
  metricConfig: MetricConfig;
  colorMap: Record<string, string>;
  defaultColor: string;
}

export const MetricChart = ({
  metric,
  metricConfig,
  colorMap,
  defaultColor
}: MetricChartProps) => {
  // Chart configuration
  const chartConfig = {
    value: {
      label: metricConfig.label,
      theme: {
        light: 'var(--color-chart-1)',
        dark: 'var(--color-chart-1)',
      },
    },
  };

  // Create color-coded legend items
  const legendPayload: LegendPayloadItem[] = metric.data.map(item => ({
    value: item.power_plant,
    type: 'square' as LegendType,
    color: colorMap[item.power_plant] || defaultColor
  }));

  return (
    <div className="space-y-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold pb-2">{metricConfig.label}</h3>
      <div className="h-[300px]">
        <ChartContainer config={chartConfig}>
          <BarChart
            data={metric.data}
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="power_plant"
              tick={{ fontSize: 12 }}
              angle={-30}
              textAnchor="end"
              height={60}
            />
            <YAxis
              label={{
                value: metric.unit,
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fontSize: 10 }
              }}
              tick={{ fontSize: 10 }}
            />
            <Tooltip
              content={
                <CustomTooltip
                  unit={metric.unit}
                  colorMap={colorMap}
                  defaultColor={defaultColor}
                />
              }
            />
            <Legend
              payload={legendPayload}
              wrapperStyle={{ fontSize: 12, marginTop: 30 }}
            />
            <Bar
              dataKey="value"
              name={metricConfig.label}
              shape={(props: any) => (
                <CustomBar
                  x={props.x}
                  y={props.y}
                  width={props.width}
                  height={props.height}
                  power_plant={props.payload.power_plant}
                  colorMap={colorMap}
                  defaultColor={defaultColor}
                />
              )}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}; 