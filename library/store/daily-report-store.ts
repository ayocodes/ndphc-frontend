// src/store/dailyReportStore.ts
import { create } from "zustand";
import { dailyReportService } from "../service/daily-report-service";
import {
  InitialDailyReportCreate,
  DailyReportUpdate,
  DailyReportWithDetails,
} from "../types/daily-report";
// import { dailyReportService } from '@/services/dailyReportService';
// import { DailyReportCreate, DailyReportResponse } from '@/types/dailyReport';

interface DailyReportState {
  currentReport: DailyReportWithDetails | null;
  isLoading: boolean;
  error: string | null;
  createDailyReport: (data: InitialDailyReportCreate) => Promise<void>;
  updateDailyReport: (
    reportId: string,
    data: DailyReportUpdate
  ) => Promise<void>;
  fetchDailyReport: (
    plantId: number,
    date: Date
  ) => Promise<DailyReportWithDetails | null>;
  resetState: () => void;
}

export const useDailyReportStore = create<DailyReportState>((set) => ({
  currentReport: null,
  isLoading: false,
  error: null,

  createDailyReport: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await dailyReportService.createDailyReport(data);
      set({
        currentReport: response as DailyReportWithDetails,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error:
          error.response?.data?.detail ||
          error.message ||
          "Failed to create daily report",
      });
      throw error;
    }
  },

  updateDailyReport: async (reportId, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await dailyReportService.updateDailyReport(
        reportId,
        data
      );
      set({
        currentReport: response as DailyReportWithDetails,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error:
          error.response?.data?.detail ||
          error.message ||
          "Failed to update daily report",
      });
      throw error;
    }
  },

  fetchDailyReport: async (plantId, date) => {
    set({ isLoading: true, error: null });
    try {
      const response = await dailyReportService.getDailyReportByPlantAndDate(
        plantId,
        date
      );
      set({
        currentReport: response as DailyReportWithDetails,
        isLoading: false,
      });
      return response as DailyReportWithDetails;
    } catch (error: any) {
      if (error.response?.status === 404) {
        set({ currentReport: null, isLoading: false });
        return null;
      }
      set({
        isLoading: false,
        error:
          error.response?.data?.detail ||
          error.message ||
          "Failed to fetch daily report",
      });
      throw error;
    }
  },

  resetState: () => {
    set({ currentReport: null, error: null });
  },
}));
