// src/services/dailyReportService.ts
import { format } from "date-fns";
import {
  InitialDailyReportCreate,
  DailyReportUpdate,
  DailyReportResponse,
} from "../types/daily-report";
import axios from "../api/axios";

export const dailyReportService = {
  createDailyReport: async (
    data: InitialDailyReportCreate
  ): Promise<DailyReportResponse> => {
    const response = await axios.post("/api/v1/reports/daily/", data);
    return response.data;
  },

  getDailyReportByPlantAndDate: async (
    plantId: number,
    date: Date
  ): Promise<any> => {
    const formattedDate = format(date, "yyyy-MM-dd");
    const response = await axios.get(
      `/api/v1/reports/daily/plant/${plantId}/date/${formattedDate}`
    );
    return response.data;
  },

  updateDailyReport: async (
    reportId: string,
    data: DailyReportUpdate
  ): Promise<DailyReportResponse> => {
    const response = await axios.put(`/api/v1/reports/daily/${reportId}`, data);
    return response.data;
  },
};
