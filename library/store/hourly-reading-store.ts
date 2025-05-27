import { create } from "zustand";
import axios from "../api/axios";
import { hourlyReadingService } from "../service/hourly-reading-service"; // Import service

// Types for hourly readings
interface HourlyReading {
  id: string;
  daily_report_id: string;
  turbine_id: number;
  hour: number;
  energy_generated: number;
}

interface HourlyReadingsUpdatePayload {
  readings: {
    turbine_id: number;
    hour: number;
    energy_generated: number;
  }[];
}

interface HourlyReadingState {
  hourlyReadings: HourlyReading[];
  isLoading: boolean;
  error: string | null;
  fetchHourlyReadings: (reportId: string) => Promise<HourlyReading[]>;
  updateHourlyReadings: (
    reportId: string,
    data: HourlyReadingsUpdatePayload
  ) => Promise<void>; // Service might return void or updated readings
  resetState: () => void;
}

export const useHourlyReadingStore = create<HourlyReadingState>((set, get) => ({
  hourlyReadings: [],
  isLoading: false,
  error: null,

  fetchHourlyReadings: async (reportId) => {
    set({ isLoading: true, error: null });
    try {
      // const response = await axios.get<HourlyReading[]>(`/api/v1/hourly-readings/${reportId}`);
      const data = await hourlyReadingService.getHourlyReadings(reportId);
      set({ hourlyReadings: data, isLoading: false });
      return data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        set({ hourlyReadings: [], isLoading: false });
        return [];
      }
      set({
        isLoading: false,
        error:
          error.response?.data?.detail ||
          error.message ||
          "Failed to fetch hourly readings",
      });
      throw error;
    }
  },

  updateHourlyReadings: async (reportId, data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedReadings = await hourlyReadingService.updateHourlyReadings(
        reportId,
        data
      );
      set({ hourlyReadings: updatedReadings, isLoading: false });
      return;
    } catch (error: any) {
      set({
        isLoading: false,
        error:
          error.response?.data?.detail ||
          error.message ||
          "Failed to update hourly readings",
      });
      throw error;
    }
  },

  resetState: () => {
    set({ hourlyReadings: [], error: null });
  },
}));
