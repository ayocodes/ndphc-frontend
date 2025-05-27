// src/library/service/hourly-reading-service.ts
import axios from "../api/axios";

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

class HourlyReadingService {
  /**
   * Fetch hourly readings for a specific daily report
   */
  async getHourlyReadings(reportId: string): Promise<HourlyReading[]> {
    try {
      const response = await axios.get<HourlyReading[]>(
        `/api/v1/hourly-readings/${reportId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update hourly readings for a specific daily report
   */
  async updateHourlyReadings(
    reportId: string,
    data: HourlyReadingsUpdatePayload
  ): Promise<HourlyReading[]> {
    try {
      const response = await axios.put<HourlyReading[]>(
        `/api/v1/hourly-readings/${reportId}`,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const hourlyReadingService = new HourlyReadingService();
