'use client';

import axios from '@/library/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/library/components/atoms/card';
import { useDashboardStore } from '@/library/store/dashboard-store';
import { PowerPlantResponse } from '@/library/types/dashboard';
import { createColorMap } from '@/library/utils/comparison-view-utils';
import {
  AlertCircle,
  Settings,
  TrendingUp
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { ComparisonFilters } from '../../library/components/molecules/ComparisonFilters';
import { MetricChart } from '../../library/components/molecules/MetricChart';
import { DEFAULT_COLOR, VALID_METRICS } from '../../library/utils/comparison-view-constants';

// Map store metric names to valid API metric names
const mapStoreMetricsToApiMetrics = (metrics: string[]): string[] => {
  const metricMap: Record<string, string> = {
    'energy_exported': 'total_energy_exported',
    'avg_power_exported': 'avg_energy_sent_out'
  };

  return metrics.map(metric => metricMap[metric] || metric)
    .filter(metric =>
      VALID_METRICS.some(validMetric => validMetric.key === metric)
    );
};

export default function ComparisonView() {
  const {
    fetchComparison,
    comparisonData,
    isLoading,
    error,
    selectedMetrics: storeSelectedMetrics,
    // setSelectedMetrics: storeSetSelectedMetrics
  } = useDashboardStore();

  const [powerPlants, setPowerPlants] = useState<PowerPlantResponse[]>([]);
  const [selectedPlants, setSelectedPlants] = useState<number[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['energy_generated']);
  const [timeRange, setTimeRange] = useState('week');
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [localError, setLocalError] = useState<string | null>(null);
  const [metricsOpen, setMetricsOpen] = useState(false);
  const [plantsOpen, setPlantsOpen] = useState(false);

  // Fetch power plants only once on component mount
  useEffect(() => {
    const fetchPowerPlants = async () => {
      try {
        const response = await axios.get<PowerPlantResponse[]>('/api/v1/power-plants');
        setPowerPlants(response.data);
        // Select all plants by default
        setSelectedPlants(response.data.map(plant => plant.id));
      } catch (error) {
        console.error('Failed to fetch power plants:', error);
        setLocalError('Failed to fetch power plants');
      }
    };

    fetchPowerPlants();

    // Initialize with store's selected metrics if available, converting to valid API metrics
    if (storeSelectedMetrics && storeSelectedMetrics.length > 0) {
      const validApiMetrics = mapStoreMetricsToApiMetrics(storeSelectedMetrics);
      if (validApiMetrics.length > 0) {
        setSelectedMetrics(validApiMetrics);
      }
    }
  }, [storeSelectedMetrics]);

  // Update comparison data when filters change
  useEffect(() => {
    if (selectedMetrics.length > 0 && selectedPlants.length > 0) {
      setLocalError(null);

      // Use the store's fetchComparison with valid API metrics
      fetchComparison(
        selectedMetrics, // These are already valid API metrics
        timeRange,
        startDate,
        endDate,
        selectedPlants.length > 0 ? selectedPlants : undefined
      );

      // We don't sync back to the store since the metric names are different
      // This component uses the valid API metrics, while the store might have its own format
    } else if (selectedMetrics.length === 0) {
      setLocalError('Please select at least one metric');
    }
  }, [selectedMetrics, selectedPlants, timeRange, startDate, endDate, fetchComparison]);

  const handleDateRangeChange = ({ from, to }: { from: Date; to: Date }) => {
    const fromStr = from.toISOString().split('T')[0];
    const toStr = to.toISOString().split('T')[0];

    setTimeRange('custom');
    setStartDate(fromStr);
    setEndDate(toStr);
  };

  const handleMetricToggle = (metricKey: string) => {
    setSelectedMetrics(current =>
      current.includes(metricKey)
        ? current.filter(m => m !== metricKey)
        : [...current, metricKey]
    );
  };

  const handlePlantToggle = (plantId: number) => {
    setSelectedPlants(current =>
      current.includes(plantId)
        ? current.filter(id => id !== plantId)
        : [...current, plantId]
    );
  };

  const toggleAllMetrics = () => {
    setSelectedMetrics(current =>
      current.length === VALID_METRICS.length ? [] : VALID_METRICS.map(m => m.key)
    );
  };

  const toggleAllPlants = () => {
    setSelectedPlants(current =>
      current.length === powerPlants.length ? [] : powerPlants.map(p => p.id)
    );
  };

  // Safely display error message
  const errorMessage = error ? (typeof error === 'string' ? error : 'An error occurred') : localError;

  // Create power plant color map
  const colorMap = createColorMap(powerPlants);

  const hasData = comparisonData && comparisonData.metrics && comparisonData.metrics.length > 0;

  return (
    <div className="container mx-auto py-8 space-y-6" id="comparison-data-container">
      {/* Page Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <TrendingUp className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Power Plants Comparison</h1>
          <p className="text-gray-600">Compare performance metrics across multiple power plants</p>
        </div>
      </div>

      {/* Filter Section */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Settings className="h-5 w-5 text-blue-600" />
            <span>Comparison Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ComparisonFilters
            metrics={VALID_METRICS}
            selectedMetrics={selectedMetrics}
            powerPlants={powerPlants}
            selectedPlants={selectedPlants}
            metricsOpen={metricsOpen}
            plantsOpen={plantsOpen}
            setMetricsOpen={setMetricsOpen}
            setPlantsOpen={setPlantsOpen}
            handleMetricToggle={handleMetricToggle}
            handlePlantToggle={handlePlantToggle}
            toggleAllMetrics={toggleAllMetrics}
            toggleAllPlants={toggleAllPlants}
            handleDateRangeChange={handleDateRangeChange}
          />
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <div className="mt-2 text-gray-600 font-medium">Loading comparison data...</div>
            <div className="text-sm text-gray-500">Please wait while we analyze the metrics</div>
          </div>
        </div>
      )}

      {/* Error State */}
      {errorMessage && !isLoading && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <div className="font-medium text-red-800">Error Loading Comparison Data</div>
                <div className="text-sm text-red-600 mt-1">{errorMessage}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison Results */}
      {hasData && !isLoading && (
        <div className="space-y-6">


          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {comparisonData.metrics.map((metric, index) => {
              const metricConfig = VALID_METRICS.find(m => m.key === metric.name);
              if (!metricConfig) return null;

              return (
                <Card key={index} className="shadow-sm border-gray-200">
                  <CardContent className="p-0">
                    <MetricChart
                      metric={metric}
                      metricConfig={metricConfig}
                      colorMap={colorMap}
                      defaultColor={DEFAULT_COLOR}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* No Data State */}
      {!isLoading && !errorMessage && !hasData && (
        <Card className="shadow-sm border-gray-200">
          <CardContent className="p-12">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Comparison Data Available</h3>
              <p className="text-sm text-gray-500 mb-4">
                Please select metrics and power plants to compare their performance.
              </p>
              <div className="text-xs text-gray-400">
                Selected: {selectedMetrics.length} metric(s) • {selectedPlants.length} plant(s)
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}