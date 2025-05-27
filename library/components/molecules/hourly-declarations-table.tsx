// src/components/molecules/hourly-declarations-table.tsx
import { Controller, Control, UseFormSetValue } from "react-hook-form";
import { Input } from "@/library/components/atoms/input";
import { MorningReadingCreate } from "@/library/types/morning-reading";

interface HourlyDeclarationsTableProps {
  plantTurbines: Array<{ id: number; name: string }>;
  control: Control<MorningReadingCreate>;
  setValue: UseFormSetValue<MorningReadingCreate>;
  isLoading: boolean;
  isSubmitting: boolean;
}

export function HourlyDeclarationsTable({
  plantTurbines,
  control,
  setValue,
  isLoading,
  isSubmitting
}: HourlyDeclarationsTableProps) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4">GT Energy Declared by Hour</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="pr-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turbine</th>
              {Array.from({ length: 24 }, (_, i) => (
                <th key={i} className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {String(i + 1).padStart(2, '0')}:00
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {plantTurbines.map((turbine, turbineIndex) => (
              <tr key={turbine.id}>
                <td className="pr-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  {turbine.name}
                </td>
                {Array.from({ length: 24 }, (_, hourIndex) => {
                  const hour = hourIndex + 1;
                  return (
                    <td key={hourIndex} className="px-1 py-1">
                      <Controller
                        name={`turbine_declarations.${turbineIndex}.hourly_declarations.${hourIndex}.declared_output`}
                        control={control}
                        defaultValue={0}
                        render={({ field }) => (
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-16 h-8 text-xs p-1"
                            {...field}
                            // Always display 0 instead of empty string to preserve values
                            value={field.value.toString()}
                            onChange={e => {
                              const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                              field.onChange(value);

                              // Ensure the turbine_id and hour are set
                              setValue(`turbine_declarations.${turbineIndex}.turbine_id`, turbine.id);
                              setValue(`turbine_declarations.${turbineIndex}.hourly_declarations.${hourIndex}.hour`, hour);
                            }}
                            onBlur={() => {
                              // When focus is lost, ensure we always have a value (even if 0)
                              if (field.value === null || field.value === undefined) {
                                field.onChange(0);
                              }
                            }}
                            disabled={isLoading || isSubmitting}
                          />
                        )}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}