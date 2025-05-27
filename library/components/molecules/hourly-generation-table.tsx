import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/library/components/atoms/table"
import { Activity, Zap } from "lucide-react"
import { AuditInfo } from './audit-info'
import { AuditInfo as AuditInfoType } from '@/library/types/dashboard'

interface TurbineData {
  turbine: string;
  hours: Record<string, number>;
  total: number;
}

interface PowerPlantData {
  power_plant: string;
  data: TurbineData[];
  audit_info?: AuditInfoType;
}

interface HourlyGenerationTableProps {
  data: PowerPlantData[];
  date: string;
  selectedPowerPlant: string;
  onPowerPlantChange: (plant: string) => void;
}

export function HourlyGenerationTable({
  data,
  date,
  selectedPowerPlant,
  onPowerPlantChange
}: HourlyGenerationTableProps) {
  const hours = Array.from({ length: 24 }, (_, i) => `${String(i + 1).padStart(2, '0')}:00`);
  const selectedPlantData = data.find(p => p.power_plant === selectedPowerPlant);

  // Calculate grand total for all turbines
  const grandTotal = selectedPlantData?.data.reduce((sum, turbine) => {
    return sum + (typeof turbine.total === 'number' ? turbine.total : 0);
  }, 0) || 0;

  return (
    <div className="space-y-0">
      {selectedPlantData && (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedPlantData.power_plant}</h3>
                  <p className="text-sm text-gray-600">Hourly Generation Data - {date}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Total Generation</div>
                <div className="text-xl font-bold text-blue-700">{grandTotal.toFixed(2)} MWh</div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[120px] font-semibold text-gray-700 sticky left-0 bg-gray-50 z-1">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4" />
                      <span>Turbine</span>
                    </div>
                  </TableHead>
                  {hours.map((hour) => (
                    <TableHead key={hour} className="text-center min-w-[80px] font-semibold text-xs text-gray-700">
                      {hour}
                    </TableHead>
                  ))}
                  <TableHead className="text-center min-w-[100px] font-semibold text-gray-700 bg-blue-50">
                    Total (MWh)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedPlantData.data.map((turbine, index) => (
                  <TableRow
                    key={turbine.turbine}
                    className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                  >
                    <TableCell className="font-semibold text-xs text-gray-900 sticky left-0 bg-inherit z-1 border-r border-gray-200">
                      {turbine.turbine}
                    </TableCell>
                    {hours.map((hour) => {
                      const value = (turbine.hours || {})[hour] || 0;
                      return (
                        <TableCell
                          key={hour}
                          className={`text-center ${value > 0 ? 'text-green-700 font-medium' : 'text-gray-400'}`}
                        >
                          {value.toFixed(2)}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center font-semibold bg-blue-50/50 border-l border-blue-200">
                      <span className="text-blue-700">
                        {typeof turbine.total === 'number' ? turbine.total.toFixed(2) : '0.00'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Summary Row */}
                <TableRow className="bg-gradient-to-r from-blue-100 to-indigo-100 border-t-2 border-blue-200 font-semibold">
                  <TableCell className="font-bold text-blue-900 sticky left-0 bg-gradient-to-r from-blue-100 to-indigo-100 z-1">
                    Plant Total
                  </TableCell>
                  {hours.map((hour) => {
                    const hourTotal = selectedPlantData.data.reduce((sum, turbine) => {
                      return sum + ((turbine.hours || {})[hour] || 0);
                    }, 0);
                    return (
                      <TableCell key={hour} className="text-center text-blue-800">
                        {hourTotal.toFixed(2)}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center font-bold text-blue-900 bg-blue-200 border-l-2 border-blue-300">
                    {grandTotal.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Audit Information */}
          {selectedPlantData.audit_info && (
            <AuditInfo auditInfo={selectedPlantData.audit_info} />
          )}
        </div>
      )}
    </div>
  );
}