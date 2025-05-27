export interface DailySummary {
  date: string;
  energy_generated: number;
  energy_exported: number;
  energy_consumed: number;
  gas_consumed: number;
  avg_power_exported: number;
  avg_dependability_index: number;
  avg_gas_utilization: number;
  avg_availability_factor: number;
}

export interface Percentage {
  energy_generated: number;
  energy_exported: number;
  energy_consumed: number;
  gas_consumed: number;
  avg_power_exported: number;
  avg_dependability_index: number;
  avg_gas_utilization: number;
  avg_availability_factor: number;
}

export interface DashboardSummary {
  current_day: DailySummary;
  previous_day: DailySummary;
  percentage_change: Percentage;
}

export interface ComparisonData {
  time_range: string;
  start_date: string;
  end_date: string;
  metrics: Array<{
    name: string;
    unit: string;
    data: Array<{
      power_plant: string;
      value: number;
      percentage: number;
    }>;
  }>;
}

export interface PowerPlantResponse {
  id: number;
  name: string;
  location: string;
  turbine_count: number;
}

export interface AuditInfo {
  created_at: string;
  updated_at: string;
  last_modified_by: {
    id: number;
    full_name: string;
    email: string;
  };
}

export interface HourlyGenerationData {
  date: string;
  power_plants: Array<{
    power_plant: string;
    data: Array<{
      turbine: string;
      hours: Record<string, number>;
      total: number;
    }>;
    audit_info?: AuditInfo;
  }>;
}

export interface MorningDeclarationsData {
  date: string;
  power_plants: Array<{
    power_plant: string;
    data: Array<{
      turbine: string;
      hours: Record<string, number>;
      total: number;
    }>;
    audit_info?: AuditInfo;
  }>;
}

export interface OperationalData {
  date: string;
  metric: string;
  power_plants: Array<{
    power_plant: string;
    data: Array<{
      turbine: string;
      value: number;
    }>;
    audit_info?: AuditInfo;
  }>;
}
