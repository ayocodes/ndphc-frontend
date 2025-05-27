import React from 'react';
import { LegendType } from 'recharts';

export interface BarProps {
  x: number;
  y: number;
  width: number;
  height: number;
  power_plant: string;
  colorMap: Record<string, string>;
  defaultColor: string;
}

export interface LegendPayloadItem {
  value: string;
  type: LegendType;
  color: string;
}

export const CustomBar = (props: BarProps) => {
  const { x, y, width, height, power_plant, colorMap, defaultColor } = props;
  const fill = colorMap[power_plant] || defaultColor;

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      rx={4}
      ry={4}
    />
  );
}; 