'use client';

import React, { useEffect, useState } from 'react';
import { useDashboardStore } from '@/library/store/dashboard-store';
import { MetricsFilter } from '@/library/components/molecules/metrics-filter';
import { HourlyGenerationTable } from '@/library/components/molecules/hourly-generation-table';
import { OperationalDataTable } from '@/library/components/molecules/operational-data-table';
import { usePowerPlantStore } from '@/library/store/power-plant-store';

import { Card, CardContent, CardHeader, CardTitle } from '@/library/components/atoms/card';
import {
  BarChart3,
  Clock,
  Activity,
  Zap,
  TrendingUp,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { OperationalData, HourlyGenerationData, MorningDeclarationsData } from '../../library/types/dashboard';



// Helper function to get Nigeria date string for API calls
const getDateStringForAPI = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export default function MetricsPage() {
  const {
    fetchHourlyGeneration,
    fetchOperationalData,
    fetchMorningDeclarations,
    hourlyGeneration,
    operationalData,
    morningDeclarations,
    isLoading,
    error
  } = useDashboardStore();

  const { powerPlants, fetchPowerPlants } = usePowerPlantStore();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMetric, setSelectedMetric] = useState<string>('hourly_generation');
  const [selectedPowerPlants, setSelectedPowerPlants] = useState<number[]>([]);

  useEffect(() => {
    fetchPowerPlants();
  }, [fetchPowerPlants]);

  useEffect(() => {
    // Initialize with all power plants selected
    if (powerPlants.length > 0 && selectedPowerPlants.length === 0) {
      setSelectedPowerPlants(powerPlants.map(plant => plant.id));
    }
  }, [powerPlants, selectedPowerPlants.length]);

  useEffect(() => {
    const fetchDataForMetric = async () => {
      const dateString = getDateStringForAPI(selectedDate);
      const powerPlantId = selectedPowerPlants.length === 1 ? selectedPowerPlants[0] : undefined;

      if (selectedMetric === 'hourly_generation') {
        await fetchHourlyGeneration(dateString, powerPlantId);
      } else if (selectedMetric === 'morning_declarations') {
        await fetchMorningDeclarations(dateString, powerPlantId);
      } else if (selectedMetric === 'operational_events') {
        // Fetch all three operational metrics sequentially
        await fetchOperationalData('startups', dateString, powerPlantId);
        const startupsData = useDashboardStore.getState().operationalData;

        await fetchOperationalData('shutdowns', dateString, powerPlantId);
        const shutdownsData = useDashboardStore.getState().operationalData;

        await fetchOperationalData('trips', dateString, powerPlantId);
        const tripsData = useDashboardStore.getState().operationalData;

        // Combine the data
        if (startupsData && shutdownsData && tripsData) {
          const combinedData: OperationalData = {
            date: dateString,
            metric: 'operational_events',
            power_plants: startupsData.power_plants.map((plant) => ({
              power_plant: plant.power_plant,
              data: plant.data.map((turbine) => ({
                turbine: turbine.turbine,
                value: turbine.value,
                startups: turbine.value,
                shutdowns: shutdownsData.power_plants
                  .find((p) => p.power_plant === plant.power_plant)
                  ?.data.find((t) => t.turbine === turbine.turbine)?.value || 0,
                trips: tripsData.power_plants
                  .find((p) => p.power_plant === plant.power_plant)
                  ?.data.find((t) => t.turbine === turbine.turbine)?.value || 0
              })),
              audit_info: plant.audit_info // Preserve audit info from the first API call
            }))
          };
          useDashboardStore.setState({ operationalData: combinedData });
        }
      } else {
        await fetchOperationalData(selectedMetric, dateString, powerPlantId);
      }
    };

    if (selectedPowerPlants.length > 0 && selectedDate) {
      fetchDataForMetric();
    }
  }, [selectedDate, selectedMetric, selectedPowerPlants, fetchHourlyGeneration, fetchOperationalData, fetchMorningDeclarations]);

  const handlePowerPlantChange = (plantName: string) => {
    const plant = powerPlants.find(p => p.name === plantName);
    if (plant) {
      setSelectedPowerPlants([plant.id]);
    }
  };

  let tableData: HourlyGenerationData['power_plants'] | MorningDeclarationsData['power_plants'] | OperationalData['power_plants'] | null = null;
  let currentDataDate: string | undefined = undefined;

  if (selectedMetric === 'hourly_generation' && hourlyGeneration) {
    tableData = hourlyGeneration.power_plants;
    currentDataDate = hourlyGeneration.date;
  } else if (selectedMetric === 'morning_declarations' && morningDeclarations) {
    tableData = morningDeclarations.power_plants;
    currentDataDate = morningDeclarations.date;
  } else if (operationalData) {
    tableData = operationalData.power_plants;
    currentDataDate = operationalData.date;
  }

  // Filter table data to only show selected power plants
  const filteredTableData = tableData?.filter((plant) =>
    selectedPowerPlants.includes(powerPlants.find(p => p.name === plant.power_plant)?.id || -1)
  );

  // Get metric display info
  const getMetricInfo = () => {
    const metricMap = {
      hourly_generation: { label: 'Hourly Generation', icon: Zap, color: 'text-yellow-600' },
      morning_declarations: { label: 'Morning Declarations', icon: TrendingUp, color: 'text-blue-600' },
      operating_hours: { label: 'Operating Hours', icon: Clock, color: 'text-purple-600' },
      operational_events: { label: 'Operational Events', icon: Activity, color: 'text-red-600' }
    };
    return metricMap[selectedMetric as keyof typeof metricMap] || { label: selectedMetric, icon: BarChart3, color: 'text-gray-600' };
  };

  const metricInfo = getMetricInfo();

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <BarChart3 className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Metrics Dashboard</h1>
          <p className="text-gray-600">View and analyze power plant operational metrics</p>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Filter Options</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MetricsFilter
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            selectedMetric={selectedMetric}
            onMetricChange={setSelectedMetric}
            selectedPowerPlants={selectedPowerPlants}
            onPowerPlantsChange={setSelectedPowerPlants}
            powerPlants={powerPlants}
          />
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <div className="mt-2 text-gray-600 font-medium">Loading metrics data...</div>
            <div className="text-sm text-gray-500">Please wait while we fetch the data</div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <div className="font-medium text-red-800">Error Loading Data</div>
                <div className="text-sm text-red-600 mt-1">{error}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Tables */}
      {filteredTableData && currentDataDate && !isLoading && (
        <div className="space-y-6">
          {/* Data Tables */}
          <div className="space-y-6">
            {(selectedMetric === 'hourly_generation' || selectedMetric === 'morning_declarations') ? (
              filteredTableData.map((plantData) => (
                <Card key={plantData.power_plant} className="shadow-sm border-gray-200">
                  <CardContent className="p-0">
                    <HourlyGenerationTable
                      data={[plantData] as never}
                      date={currentDataDate}
                      selectedPowerPlant={plantData.power_plant}
                      onPowerPlantChange={handlePowerPlantChange}
                    />
                  </CardContent>
                </Card>
              ))
            ) : (
              filteredTableData.map((plantData) => (
                <Card key={plantData.power_plant} className="shadow-sm border-gray-200">
                  <CardContent className="p-0">
                    <OperationalDataTable
                      data={[plantData] as never}
                      metric={operationalData?.metric || selectedMetric}
                      date={currentDataDate}
                      selectedPowerPlant={plantData.power_plant}
                      onPowerPlantChange={handlePowerPlantChange}
                    />
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* No Data State */}
      {!isLoading && !error && (!filteredTableData || filteredTableData.length === 0) && (
        <Card className="shadow-sm border-gray-200">
          <CardContent className="p-12">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
              <p className="text-sm text-gray-500 mb-4">
                No metrics data found for the selected criteria. Try adjusting your filters.
              </p>
              <div className="text-xs text-gray-400">
                Selected: {metricInfo.label} • {new Date(selectedDate).toLocaleDateString()} • {selectedPowerPlants.length} plant(s)
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}