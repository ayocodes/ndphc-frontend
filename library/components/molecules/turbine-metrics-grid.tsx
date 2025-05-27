// src/components/molecules/turbine-metrics-grid.tsx
import React from 'react';
import { Controller, Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/library/components/atoms/card";
import { Input } from "@/library/components/atoms/input";
import { Activity } from "lucide-react";

interface Turbine {
  id: number;
  name: string;
}

interface TurbineMetricsGridProps {
  title: string;
  fieldPrefix: string;
  unit: string;
  turbines: Turbine[];
  control: Control<any>;
  disabled: boolean;
  type?: 'number' | 'integer';
  description?: string;
}

export const TurbineMetricsGrid = ({ 
  title, 
  fieldPrefix, 
  unit, 
  turbines, 
  control, 
  disabled, 
  type = 'number',
  description 
}: TurbineMetricsGridProps) => (
  <Card className="shadow-sm border-gray-200">
    <CardHeader className="pb-4">
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-purple-600" />
          <span className="text-lg">{title}</span>
        </div>
        <span className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded">
          {turbines.length} turbines
        </span>
      </CardTitle>
      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}
    </CardHeader>
    <CardContent className="pt-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {turbines.map((turbine, index) => (
          <div key={turbine.id} className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>{turbine.name}</span>
              <span className="text-gray-500">({unit})</span>
            </label>
            <Controller
              name={`initial_turbine_stats.${index}.${fieldPrefix}`}
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  step={type === 'integer' ? '1' : '0.01'}
                  min="0"
                  placeholder="0"
                  className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                  {...field}
                  value={field.value === 0 ? '' : field.value}
                  onChange={e => field.onChange(
                    type === 'integer' 
                      ? parseInt(e.target.value, 10) || 0
                      : parseFloat(e.target.value) || 0
                  )}
                  disabled={disabled}
                />
              )}
            />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);