// src/components/molecules/form-field.tsx
import React from 'react';
import { Controller, Control } from "react-hook-form";
import { Input } from "@/library/components/atoms/input";

interface FormFieldProps {
  label: string;
  name: string;
  control: Control<any>;
  type?: 'number' | 'text';
  step?: string;
  min?: string;
  unit?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  rules?: object;
  errors?: any;
  placeholder?: string;
}

export const FormField = ({ 
  label, 
  name, 
  control, 
  type = 'number', 
  step = '0.01', 
  min = '0', 
  unit, 
  required = false, 
  disabled = false,
  className = '',
  rules,
  errors,
  placeholder
}: FormFieldProps) => (
  <div className={`space-y-2 ${className}`}>
    <label htmlFor={name} className="flex items-center text-sm font-medium text-gray-700">
      <span>{label}</span>
      {unit && <span className="ml-1 text-gray-500">({unit})</span>}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <Input
          id={name}
          type={type}
          step={step}
          min={min}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-200"
          {...field}
          // Fix: Always provide a string value, never undefined
          value={field.value == null || field.value === 0 ? '' : String(field.value)}
          onChange={e => {
            const value = e.target.value;
            if (type === 'number') {
              // Convert to number, but handle empty string as 0
              field.onChange(value === '' ? 0 : parseFloat(value) || 0);
            } else {
              field.onChange(value);
            }
          }}
          disabled={disabled}
        />
      )}
    />
    {errors?.[name] && (
      <p className="text-sm text-red-500">{errors[name].message}</p>
    )}
  </div>
);