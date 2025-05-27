// src/types/dailyReport.ts
export interface HourlyGeneration {
  hour: number;
  energy_generated: number;
}

export interface TurbineDailyStats {
  turbine_id: number;
  energy_generated: number;
  energy_exported: number;
  operating_hours: number;
  startup_count: number;
  shutdown_count: number;
  trips: number;
  hourly_generations: HourlyGeneration[];
}

// Data for individual turbines in the initial/update payload
export interface InitialTurbineStatData {
  turbine_id: number;
  energy_generated: number;
  energy_exported: number;
  operating_hours: number;
  startup_count: number;
  shutdown_count: number;
  trips: number;
}

// Initial creation of daily report
export interface InitialDailyReportCreate {
  date: string;
  power_plant_id: number;
  gas_loss: number;
  ncc_loss: number;
  internal_loss: number;
  gas_consumed: number;
  declaration_total: number;
  availability_capacity: number;
  initial_turbine_stats: InitialTurbineStatData[];
}

// Update request for daily report
export interface DailyReportUpdate {
  gas_loss: number;
  ncc_loss: number;
  internal_loss: number;
  gas_consumed: number;
  declaration_total: number;
  availability_capacity: number;
  turbine_stats: InitialTurbineStatData[];
}

// Calculations from the backend
export interface DailyReportCalculations {
  availability_factor: number;
  plant_heat_rate: number;
  thermal_efficiency: number;
  energy_generated: number;
  energy_exported: number;
  energy_consumed: number;
  availability_forecast: number;
  dependability_index: number;
  avg_energy_sent_out: number;
  gas_utilization: number;
  load_factor: number;
}

// Base response fields
export interface DailyReportResponse {
  id: string;
  date: string;
  power_plant_id: number;
  user_id: number;
  energy_exported: number;
  gas_loss: number;
  ncc_loss: number;
  internal_loss: number;
  gas_consumed: number;
  declaration_total: number | null;
  availability_capacity: number | null;
  submission_deadline: string;
  is_late_submission: boolean;
  last_modified_by_id: number | null;
  updated_at: string;
}

// Detailed response including turbine stats and calculations
export interface DailyReportWithDetails extends DailyReportResponse {
  turbine_stats: TurbineDailyStats[];
  hourly_readings: HourlyGeneration[];
  calculations: DailyReportCalculations;
}
