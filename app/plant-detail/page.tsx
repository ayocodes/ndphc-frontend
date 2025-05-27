"use client";

import axios from "@/library/api/axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/library/components/atoms/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/library/components/atoms/select";
import { DateRangeSelector } from "@/library/components/molecules/date-range-selector";
import { DownloadReportButton } from "@/library/components/molecules/download-report-button";
import {
  ChartTypeOption,
  MetricChart,
} from "@/library/components/molecules/metric-chart";
import { PowerPlantResponse } from "@/library/types/dashboard";
import {
  CHART_GROUPS,
  PlantDetailResponse,
} from "@/library/types/plant-detail";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Building2,
  Calendar,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ChartTypeState {
  [key: string]: ChartTypeOption;
}

interface DailyDataItem {
  energy_generated?: number;
  energy_exported?: number;
  energy_consumed?: number;
  gas_consumed?: number;
}

function SummaryCard({
  dailyData,
}: {
  dailyData: DailyDataItem[];
  timeRange: { start_date: string; end_date: string };
}) {
  const totalGeneration = dailyData.reduce(
    (sum, d) => sum + (d.energy_generated || 0),
    0
  );
  const totalExported = dailyData.reduce(
    (sum, d) => sum + (d.energy_exported || 0),
    0
  );
  const totalConsumption = dailyData.reduce(
    (sum, d) => sum + (d.energy_consumed || 0),
    0
  );
  const totalGas = dailyData.reduce((sum, d) => sum + (d.gas_consumed || 0), 0);

  return (
    <Card className="shadow-sm border-gray-200 min-w-[280px]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-base">
          <BarChart3 className="h-4 w-4 text-blue-600" />
          <span>Summary Report</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <div className="text-gray-500 text-xs">Total Generation</div>
            <div className="font-bold text-green-700 tabular-nums">
              {totalGeneration.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}{" "}
              MWh
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-gray-500 text-xs">Total Export</div>
            <div className="font-bold text-blue-700 tabular-nums">
              {totalExported.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}{" "}
              MWh
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-gray-500 text-xs">Total Consumption</div>
            <div className="font-bold text-purple-700 tabular-nums">
              {totalConsumption.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}{" "}
              MWh
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-gray-500 text-xs">Total Gas</div>
            <div className="font-bold text-orange-700 tabular-nums">
              {totalGas.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 3,
              })}{" "}
              MMscf
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PlantDetailPage() {
  const [powerPlants, setPowerPlants] = useState<PowerPlantResponse[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
  const [plantData, setPlantData] = useState<PlantDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Store chart type preferences for each chart
  const [chartTypes, setChartTypes] = useState<ChartTypeState>({});

  // Fetch power plants on component mount
  useEffect(() => {
    const fetchPowerPlants = async () => {
      try {
        const response = await axios.get<PowerPlantResponse[]>(
          "/api/v1/power-plants"
        );
        setPowerPlants(response.data);
        if (response.data.length > 0) {
          const firstPlantId = response.data[0].id;
          setSelectedPlantId(firstPlantId);

          // Fetch initial data for the last week
          const today = new Date();
          const lastWeek = new Date(today);
          lastWeek.setDate(lastWeek.getDate() - 7);

          fetchPlantDetails(
            firstPlantId,
            lastWeek.toISOString().split("T")[0],
            today.toISOString().split("T")[0]
          );
        }
      } catch (error) {
        console.error("Failed to fetch power plants:", error);
        setError("Failed to fetch power plants");
      }
    };

    fetchPowerPlants();
  }, []);

  const fetchPlantDetails = async (
    plantId: number,
    startDate: string,
    endDate: string
  ) => {
    if (!plantId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<PlantDetailResponse>(
        `/api/v1/dashboard/plant/${plantId}/details`,
        {
          params: {
            start_date: startDate,
            end_date: endDate,
          },
        }
      );
      setPlantData(response.data);
    } catch (error) {
      console.error("Failed to fetch plant details:", error);
      setError("Failed to fetch plant details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateRangeChange = ({ from, to }: { from: Date; to: Date }) => {
    if (selectedPlantId) {
      fetchPlantDetails(
        selectedPlantId,
        from.toISOString().split("T")[0],
        to.toISOString().split("T")[0]
      );
    }
  };

  const handlePlantChange = (value: string) => {
    const plantId = parseInt(value, 10);
    setSelectedPlantId(plantId);

    // Fetch data for the last week by default
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    fetchPlantDetails(
      plantId,
      lastWeek.toISOString().split("T")[0],
      today.toISOString().split("T")[0]
    );
  };

  // Generate a unique ID for each chart
  const getChartId = (groupTitle: string, chartTitle: string) => {
    return `${groupTitle}-${chartTitle}`.replace(/\s+/g, "-").toLowerCase();
  };

  // Handle chart type change
  const handleChartTypeChange = (chartId: string, type: ChartTypeOption) => {
    setChartTypes((prev) => ({
      ...prev,
      [chartId]: type,
    }));
  };

  // Set default chart type for "Energy Generated vs Exported" to line if not already set
  useEffect(() => {
    if (plantData) {
      // Set defaults for specific charts
      const defaultTypes: Record<string, ChartTypeOption> = {};

      // Find the energy group and set its first chart (Energy Generated vs Exported) to line chart by default
      const energyGroup = CHART_GROUPS.find(
        (group) => group.title === "Energy and Gas"
      );
      if (energyGroup && energyGroup.charts.length > 0) {
        const generatedExportedChart = energyGroup.charts.find(
          (chart) => chart.title === "Energy Generated vs Exported"
        );

        if (generatedExportedChart) {
          const chartId = getChartId(
            "Energy and Gas",
            "Energy Generated vs Exported"
          );
          defaultTypes[chartId] = "line";
        }
      }

      // Apply all defaults
      setChartTypes((prev) => ({
        ...prev,
        ...Object.fromEntries(
          Object.entries(defaultTypes).filter(([id]) => prev[id] === undefined)
        ),
      }));
    }
  }, [plantData]);

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Building2 className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plant Details</h1>
          <p className="text-gray-600">
            Comprehensive analytics and performance metrics
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Settings className="h-5 w-5 text-blue-600" />
            <span>Filter Options</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Power Plant:
                </label>
                <Select
                  value={selectedPlantId?.toString()}
                  onValueChange={handlePlantChange}
                >
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select power plant" />
                  </SelectTrigger>
                  <SelectContent>
                    {powerPlants.map((plant) => (
                      <SelectItem key={plant.id} value={plant.id.toString()}>
                        {plant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DateRangeSelector onRangeChange={handleDateRangeChange} />
            </div>

            {/* Download Button */}
            {plantData && <DownloadReportButton />}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <div className="mt-2 text-gray-600 font-medium">
              Loading plant details...
            </div>
            <div className="text-sm text-gray-500">
              Please wait while we fetch the analytics data
            </div>
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
                <div className="font-medium text-red-800">
                  Error Loading Plant Data
                </div>
                <div className="text-sm text-red-600 mt-1">{error}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plant Data Display */}
      {plantData && !isLoading && (
        <div className="space-y-6" id="plant-data-container">
          {/* Plant Overview Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {plantData.power_plant.name}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Activity className="h-4 w-4" />
                  <span>
                    Total Capacity:{" "}
                    <span className="font-semibold">
                      {plantData.power_plant.total_capacity} MW
                    </span>
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Analysis Period:{" "}
                    <span className="font-semibold">
                      {plantData.time_range.start_date} to{" "}
                      {plantData.time_range.end_date}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <SummaryCard
                dailyData={plantData.daily_data}
                timeRange={plantData.time_range}
              />
            </div>
          </div>

          {/* Chart Groups */}
          {CHART_GROUPS.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-4">
              {/* Group Header */}
              <div className="pb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {group.title}
                </h3>
                {group.description && (
                  <p className="text-sm text-gray-600">{group.description}</p>
                )}
              </div>

              {/* Charts Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                {group.charts.map((chart, chartIndex) => {
                  const chartId = getChartId(group.title, chart.title);
                  const defaultType =
                    chart.title === "Energy Generated vs Exported"
                      ? "line"
                      : "bar";

                  return (
                    <MetricChart
                      key={chartIndex}
                      data={plantData.daily_data}
                      config={chart}
                      isStacked={group.title === "Losses"}
                      chartType={chartTypes[chartId] || defaultType}
                      onChartTypeChange={(type) =>
                        handleChartTypeChange(chartId, type)
                      }
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Data State */}
      {!isLoading && !error && !plantData && (
        <Card className="shadow-sm border-gray-200">
          <CardContent className="p-12">
            <div className="text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Plant Data Available
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Please select a power plant to view detailed analytics and
                performance metrics.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
