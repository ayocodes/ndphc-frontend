// src/store/dashboardStore.ts
import { create } from "zustand";
import axios from "../api/axios";
import {
  DashboardSummary,
  ComparisonData,
  HourlyGenerationData,
  MorningDeclarationsData,
  OperationalData,
} from "../types/dashboard";

interface DashboardState {
  summary: DashboardSummary | null;
  comparisonData: ComparisonData | null;
  hourlyGeneration: HourlyGenerationData | null;
  morningDeclarations: MorningDeclarationsData | null;
  operationalData: OperationalData | null;
  timeRange: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  selectedMetrics: string[];
  selectedDate: string;
  selectedOperationalMetric: string;
  isLoading: boolean;
  error: string | null;
  fetchSummary: () => Promise<void>;
  fetchComparison: (
    metrics: string[],
    timeRange: string,
    startDate?: string,
    endDate?: string,
    powerPlantIds?: number[]
  ) => Promise<void>;
  fetchHourlyGeneration: (date: string, powerPlantId?: number) => Promise<void>;
  fetchMorningDeclarations: (
    date: string,
    powerPlantId?: number
  ) => Promise<void>;
  fetchOperationalData: (
    metric: string,
    date: string,
    powerPlantId?: number
  ) => Promise<void>;
  fetchPlantDetails: (
    powerPlantId: number,
    startDate: string,
    endDate: string
  ) => Promise<any>;
  setTimeRange: (range: string) => void;
  setDateRange: (startDate: string, endDate: string) => void;
  setSelectedMetrics: (metrics: string[]) => void;
  setSelectedDate: (date: string) => void;
  setSelectedOperationalMetric: (metric: string) => void;
}

export const useDashboardStore = create<DashboardState>()((set) => {
  const today = new Date();
  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  return {
    summary: null,
    comparisonData: null,
    hourlyGeneration: null,
    morningDeclarations: null,
    operationalData: null,
    timeRange: "week",
    dateRange: {
      startDate: formatDate(new Date(new Date().setDate(today.getDate() - 7))),
      endDate: formatDate(today),
    },
    selectedMetrics: [
      "energy_generated",
      "energy_exported",
      "energy_consumed",
      "gas_consumed",
      "avg_power_exported",
    ],
    selectedDate: formatDate(today),
    selectedOperationalMetric: "operating_hours",
    isLoading: false,
    error: null,

    fetchSummary: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await axios.get<DashboardSummary>(
          "/api/v1/dashboard/summary"
        );
        set({ summary: response.data, isLoading: false });
      } catch (error) {
        set({
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch dashboard summary",
        });
      }
    },

    fetchComparison: async (
      metrics,
      timeRange,
      startDate,
      endDate,
      powerPlantIds
    ) => {
      set({ isLoading: true, error: null });
      try {
        const searchParams = new URLSearchParams();
        if (metrics && metrics.length > 0) {
          metrics.forEach((metric) => {
            searchParams.append("metrics", metric);
          });
        }
        searchParams.append("time_range", timeRange);
        if (timeRange === "custom" && startDate && endDate) {
          searchParams.append("start_date", startDate);
          searchParams.append("end_date", endDate);
        }
        if (powerPlantIds && powerPlantIds.length > 0) {
          powerPlantIds.forEach((id) => {
            searchParams.append("power_plant_ids", id.toString());
          });
        }
        const response = await axios.get<ComparisonData>(
          `/api/v1/dashboard/comparison?${searchParams.toString()}`
        );
        set({ comparisonData: response.data, isLoading: false });
      } catch (error: any) {
        console.error("Error fetching comparison data:", error);
        set({
          isLoading: false,
          error:
            error.response?.data?.detail ||
            (error instanceof Error
              ? error.message
              : "Failed to fetch comparison data"),
        });
      }
    },

    fetchHourlyGeneration: async (date, powerPlantId) => {
      set({ isLoading: true, error: null });
      try {
        const params: Record<string, any> = { date_param: date };
        if (powerPlantId) params.power_plant_id = powerPlantId;
        const response = await axios.get<HourlyGenerationData>(
          "/api/v1/dashboard/hourly-generation",
          { params }
        );
        set({ hourlyGeneration: response.data, isLoading: false });
      } catch (error: any) {
        set({
          isLoading: false,
          error:
            error.response?.data?.detail ||
            (error instanceof Error
              ? error.message
              : "Failed to fetch hourly generation data"),
        });
      }
    },

    fetchMorningDeclarations: async (date, powerPlantId) => {
      set({ isLoading: true, error: null });
      try {
        const params: Record<string, any> = { date_param: date };
        if (powerPlantId) params.power_plant_id = powerPlantId;
        const response = await axios.get<MorningDeclarationsData>(
          "/api/v1/dashboard/morning-declarations",
          { params }
        );
        set({ morningDeclarations: response.data, isLoading: false });
      } catch (error: any) {
        set({
          isLoading: false,
          error:
            error.response?.data?.detail ||
            (error instanceof Error
              ? error.message
              : "Failed to fetch morning declarations data"),
        });
      }
    },

    fetchOperationalData: async (metric, date, powerPlantId) => {
      set({ isLoading: true, error: null });
      try {
        const params: Record<string, any> = { metric, date_param: date };
        if (powerPlantId) params.power_plant_id = powerPlantId;
        const response = await axios.get<OperationalData>(
          "/api/v1/dashboard/operational",
          { params }
        );
        set({ operationalData: response.data, isLoading: false });
      } catch (error: any) {
        set({
          isLoading: false,
          error:
            error.response?.data?.detail ||
            (error instanceof Error
              ? error.message
              : "Failed to fetch operational data"),
        });
      }
    },

    fetchPlantDetails: async (powerPlantId, startDate, endDate) => {
      set({ isLoading: true, error: null });
      try {
        const response = await axios.get(
          `/api/v1/dashboard/plant/${powerPlantId}/details`,
          {
            params: {
              start_date: startDate,
              end_date: endDate,
            },
          }
        );
        set({ isLoading: false });
        return response.data;
      } catch (error: any) {
        set({
          isLoading: false,
          error:
            error.response?.data?.detail ||
            (error instanceof Error
              ? error.message
              : "Failed to fetch plant details"),
        });
        return null;
      }
    },

    setTimeRange: (range) => set({ timeRange: range }),
    setDateRange: (startDate, endDate) =>
      set({ dateRange: { startDate, endDate } }),
    setSelectedMetrics: (metrics) => set({ selectedMetrics: metrics }),
    setSelectedDate: (date) => set({ selectedDate: date }),
    setSelectedOperationalMetric: (metric) =>
      set({ selectedOperationalMetric: metric }),
  };
});
