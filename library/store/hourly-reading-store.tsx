// src/library/store/hourly-reading-store.ts
import { create } from 'zustand';
import axios from '../api/axios';

// Types for hourly readings
interface HourlyReading {
  id: string;
  daily_report_id: string;
  turbine_id: number;
  hour: number;
  energy_generated: number;
  // energy_exported: number;
}

interface HourlyReadingsUpdatePayload {
  readings: {
    turbine_id: number;
    hour: number;
    energy_generated: number;
    // energy_exported: number;
  }[];
}

interface HourlyReadingState {
  hourlyReadings: HourlyReading[];
  isLoading: boolean;
  error: string | null;
  fetchHourlyReadings: (reportId: string) => Promise<HourlyReading[]>;
  updateHourlyReadings: (reportId: string, data: HourlyReadingsUpdatePayload) => Promise<void>;
  resetState: () => void;
}

export const useHourlyReadingStore = create<HourlyReadingState>((set, get) => ({
  hourlyReadings: [],
  isLoading: false,
  error: null,

  fetchHourlyReadings: async (reportId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get<HourlyReading[]>(`/api/v1/hourly-readings/${reportId}`);
      set({ hourlyReadings: response.data, isLoading: false });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        set({ hourlyReadings: [], isLoading: false });
        return [];
      }
      set({ 
        isLoading: false, 
        error: error.response?.data?.detail || error.message || 'Failed to fetch hourly readings' 
      });
      throw error;
    }
  },

  updateHourlyReadings: async (reportId, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put<HourlyReading[]>(`/api/v1/hourly-readings/${reportId}`, data);
      set({ isLoading: false });
      return;
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.detail || error.message || 'Failed to update hourly readings' 
      });
      throw error;
    }
  },

  resetState: () => {
    set({ hourlyReadings: [], error: null });
  }
}));