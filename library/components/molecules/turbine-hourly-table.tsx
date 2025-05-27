// src/components/molecules/turbine-hourly-table.tsx
import React from 'react';
import { Controller, Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/library/components/atoms/card";
import { Input } from "@/library/components/atoms/input";
import { Activity } from "lucide-react";

interface Turbine {
  id: number;
  name: string;
}

interface TurbineHourlyTableProps {
  title: string;
  turbines: Turbine[];
  control: Control<any>;
  disabled?: boolean;
  fieldNamePattern: (turbineIndex: number, hourIndex: number) => string;
  onFieldChange?: (turbineIndex: number, hourIndex: number, value: number, turbineId: number, hour: number) => void;
  calculateTurbineTotal?: (turbineIndex: number) => number;
  calculateGrandTotal?: () => number;
  placeholder?: string;
  unit?: string;
  description?: string;
  cellClassName?: (turbineIndex: number, hourIndex: number) => string;
}

export const TurbineHourlyTable = ({
  title,
  turbines,
  control,
  disabled = false,
  fieldNamePattern,
  onFieldChange,
  calculateTurbineTotal,
  calculateGrandTotal,
  placeholder = "0",
  unit = "MWh",
  description,
  cellClassName
}: TurbineHourlyTableProps) => {
  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-purple-600" />
            <span className="text-lg">{title}</span>
          </div>

        </CardTitle>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-y border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 sticky left-0 bg-gray-50 border-r border-gray-200">
                  Turbine
                </th>
                {Array.from({ length: 24 }, (_, i) => (
                  <th key={i} className="px-2 py-3 text-center text-xs font-medium text-gray-600 min-w-[60px]">
                    <div className="flex flex-col">
                      <span>{String(i + 1).padStart(2, '0')}:00</span>
                      <span className="text-gray-400 font-normal">H{i + 1}</span>
                    </div>
                  </th>
                ))}
                {calculateTurbineTotal && (
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 sticky right-0 bg-gray-50 border-l border-gray-200">
                    Total
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {turbines.map((turbine, turbineIndex) => {
                const turbineTotal = calculateTurbineTotal ? calculateTurbineTotal(turbineIndex) : 0;
                return (
                  <tr key={turbine.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 sticky left-0 bg-white border-r border-gray-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="font-medium text-gray-900 text-sm">{turbine.name}</span>
                      </div>
                    </td>
                    {Array.from({ length: 24 }, (_, hourIndex) => {
                      const hour = hourIndex + 1;
                      const fieldName = fieldNamePattern(turbineIndex, hourIndex);
                      const cellClass = cellClassName ? cellClassName(turbineIndex, hourIndex) : '';
                      
                      return (
                        <td key={hourIndex} className="px-1 py-2">
                          <Controller
                            name={fieldName}
                            control={control}
                            defaultValue={0}
                            render={({ field }) => (
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder={placeholder}
                                className={`w-14 h-8 text-xs p-1 text-center transition-all ${
                                  cellClass || 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                }`}
                                {...field}
                                value={field.value === 0 ? '' : field.value}
                                onChange={e => {
                                  const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                  field.onChange(value);
                                  if (onFieldChange) {
                                    onFieldChange(turbineIndex, hourIndex, value, turbine.id, hour);
                                  }
                                }}
                                disabled={disabled}
                              />
                            )}
                          />
                        </td>
                      );
                    })}
                    {calculateTurbineTotal && (
                      <td className="px-4 py-3 sticky right-0 bg-white border-l border-gray-200">
                        <div className={`text-center font-semibold px-2 py-1 rounded ${
                          turbineTotal > 0 ? 'text-blue-700 bg-blue-50' : 'text-gray-500'
                        }`}>
                          {turbineTotal.toFixed(2)}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};