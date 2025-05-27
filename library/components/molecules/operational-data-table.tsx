import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/library/components/atoms/table"
import { Activity, Clock, TrendingUp, AlertTriangle, Zap } from "lucide-react"
import { AuditInfo } from './audit-info'
import { AuditInfo as AuditInfoType } from '@/library/types/dashboard'

interface TurbineData {
  turbine: string;
  value: number;
  startups?: number;
  shutdowns?: number;
  trips?: number;
}

interface PowerPlantData {
  power_plant: string;
  data: TurbineData[];
  audit_info?: AuditInfoType;
}

interface OperationalDataTableProps {
  data: PowerPlantData[];
  metric: string;
  date: string;
  selectedPowerPlant: string;
  onPowerPlantChange: (plant: string) => void;
}

export function OperationalDataTable({
  data,
  metric,
  date,
  selectedPowerPlant,
  onPowerPlantChange
}: OperationalDataTableProps) {
  const metricLabels = {
    operating_hours: "Operating Hours",
    startups: "Startups",
    shutdowns: "Shutdowns",
    trips: "Trips",
    operational_events: "Operational Events"
  };

  const metricIcons = {
    operating_hours: Clock,
    startups: TrendingUp,
    shutdowns: TrendingUp,
    trips: AlertTriangle,
    operational_events: Activity
  };

  const metricColors = {
    operating_hours: "text-purple-600",
    startups: "text-green-600",
    shutdowns: "text-blue-600",
    trips: "text-red-600",
    operational_events: "text-orange-600"
  };

  const selectedPlantData = data.find(p => p.power_plant === selectedPowerPlant);
  const showOperationalEvents = metric === 'operational_events';
  const IconComponent = metricIcons[metric as keyof typeof metricIcons] || Activity;
  const iconColor = metricColors[metric as keyof typeof metricColors] || "text-gray-600";

  // Calculate totals for operational events
  const calculateTotals = () => {
    if (!selectedPlantData || !showOperationalEvents) return null;

    return selectedPlantData.data.reduce((totals, turbine) => ({
      startups: totals.startups + (turbine.startups || 0),
      shutdowns: totals.shutdowns + (turbine.shutdowns || 0),
      trips: totals.trips + (turbine.trips || 0)
    }), { startups: 0, shutdowns: 0, trips: 0 });
  };

  const totals = calculateTotals();

  // Calculate single metric total
  const singleMetricTotal = selectedPlantData?.data.reduce((sum, turbine) => sum + turbine.value, 0) || 0;

  return (
    <div className="space-y-0">
      {selectedPlantData && (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 bg-gray-100 rounded-lg`}>
                  <IconComponent className={`h-5 w-5 ${iconColor}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedPlantData.power_plant}</h3>
                  <p className="text-sm text-gray-600">
                    {showOperationalEvents ? "Operational Events" : metricLabels[metric as keyof typeof metricLabels] || metric} - {date}
                  </p>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="text-right">
                {showOperationalEvents && totals ? (
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xs text-gray-500">Startups</div>
                      <div className="text-lg font-bold text-green-700">{totals.startups}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Shutdowns</div>
                      <div className="text-lg font-bold text-blue-700">{totals.shutdowns}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Trips</div>
                      <div className="text-lg font-bold text-red-700">{totals.trips}</div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-sm text-gray-500">Total {metricLabels[metric as keyof typeof metricLabels] || metric}</div>
                    <div className={`text-xl font-bold ${iconColor.replace('text-', 'text-')}`}>
                      {metric === "operating_hours" ? singleMetricTotal.toFixed(2) : singleMetricTotal}
                      {metric === "operating_hours" ? " hrs" : ""}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[200px] font-semibold text-gray-700">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4" />
                      <span>Turbine</span>
                    </div>
                  </TableHead>
                  {showOperationalEvents ? (
                    <>
                      <TableHead className="text-center font-medium text-green-700">
                        <div className="flex items-center justify-center space-x-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>Startups</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center font-medium text-blue-700">
                        <div className="flex items-center justify-center space-x-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>Shutdowns</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center font-medium text-red-700">
                        <div className="flex items-center justify-center space-x-1">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Trips</span>
                        </div>
                      </TableHead>
                    </>
                  ) : (
                    <TableHead className="text-center font-semibold text-gray-700">
                      <div className="flex items-center justify-center space-x-1">
                        <IconComponent className="h-4 w-4" />
                        <span>{metricLabels[metric as keyof typeof metricLabels] || metric}</span>
                      </div>
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedPlantData.data.map((turbine, index) => (
                  <TableRow
                    key={turbine.turbine}
                    className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                  >
                    <TableCell className="font-medium text-gray-900">{turbine.turbine}</TableCell>
                    {showOperationalEvents ? (
                      <>
                        <TableCell className="text-center">
                          <span className={`font-medium ${(turbine.startups || 0) > 0 ? 'text-green-700' : 'text-gray-400'}`}>
                            {turbine.startups || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`font-medium ${(turbine.shutdowns || 0) > 0 ? 'text-blue-700' : 'text-gray-400'}`}>
                            {turbine.shutdowns || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`font-medium ${(turbine.trips || 0) > 0 ? 'text-red-700' : 'text-gray-400'}`}>
                            {turbine.trips || 0}
                          </span>
                        </TableCell>
                      </>
                    ) : (
                      <TableCell className="text-center">
                        <span className={`font-medium ${turbine.value > 0 ? iconColor : 'text-gray-400'}`}>
                          {metric === "operating_hours" ? turbine.value.toFixed(2) : turbine.value}
                          {metric === "operating_hours" ? " hrs" : ""}
                        </span>
                      </TableCell>
                    )}
                  </TableRow>
                ))}

                {/* Summary Row */}
                {(showOperationalEvents && totals) && (
                  <TableRow className="bg-gradient-to-r from-gray-100 to-slate-100 border-t-2 border-gray-200 font-semibold">
                    <TableCell className="font-bold text-gray-900">
                      Plant Total
                    </TableCell>
                    <TableCell className="text-center font-bold text-green-700">
                      {totals.startups}
                    </TableCell>
                    <TableCell className="text-center font-bold text-blue-700">
                      {totals.shutdowns}
                    </TableCell>
                    <TableCell className="text-center font-bold text-red-700">
                      {totals.trips}
                    </TableCell>
                  </TableRow>
                )}

                {/* Summary Row for single metrics */}
                {!showOperationalEvents && (
                  <TableRow className="bg-gradient-to-r from-gray-100 to-slate-100 border-t-2 border-gray-200 font-semibold">
                    <TableCell className="font-bold text-gray-900">
                      Plant Total
                    </TableCell>
                    <TableCell className={`text-center font-bold ${iconColor}`}>
                      {metric === "operating_hours" ? singleMetricTotal.toFixed(2) : singleMetricTotal}
                      {metric === "operating_hours" ? " hrs" : ""}
                    </TableCell>
                  </TableRow>
                )}
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