import React from 'react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  unit: string;
  colorMap: Record<string, string>;
  defaultColor: string;
}

export const CustomTooltip = ({
  active,
  payload,
  label,
  unit,
  colorMap,
  defaultColor
}: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload;
  const color = colorMap[data.power_plant] || defaultColor;

  return (
    <div className="custom-tooltip bg-white p-3 border border-gray-200 rounded shadow-md">
      <p className="font-semibold text-sm" style={{ color }}>
        {data.power_plant}
      </p>
      <p className="text-sm font-medium mt-1">{`${payload[0].value.toLocaleString()} ${unit}`}</p>
    </div>
  );
}; 