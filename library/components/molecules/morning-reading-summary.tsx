// src/components/molecules/morning-reading-summary.tsx
import { Card, CardContent } from "@/library/components/atoms/card";

interface MorningReadingSummaryProps {
  plantTurbines: Array<{ id: number; name: string }>;
  calculateGrandTotal: () => number;
  calculateTurbineTotal: (index: number) => number;
}

export function MorningReadingSummary({
  plantTurbines,
  calculateGrandTotal,
  calculateTurbineTotal
}: MorningReadingSummaryProps) {
  return (
    <Card className="bg-gray-50 border-gray-200">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-600">
            Total Declared Output
          </div>
          <div className="text-lg font-semibold">
            {calculateGrandTotal().toFixed(2)} MWh
          </div>
        </div>
        <div className="mt-2 space-y-1">
          {plantTurbines.map((turbine, index) => (
            <div key={turbine.id} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{turbine.name}</span>
              <span className="font-medium">{calculateTurbineTotal(index).toFixed(2)} MWh</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}