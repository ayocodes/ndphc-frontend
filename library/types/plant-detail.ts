export interface PlantDetailResponse {
  power_plant: {
    id: number;
    name: string;
    total_capacity: number;
  };
  time_range: {
    start_date: string;
    end_date: string;
  };
  daily_data: DailyData[];
  turbines: Turbine[];
}

export interface DailyData {
  date: string;
  energy_generated: number;
  energy_exported: number;
  energy_consumed: number;
  gas_consumed: number;
  availability_capacity: number;
  availability_forecast: number;
  availability_factor: number;
  plant_heat_rate: number;
  thermal_efficiency: number;
  dependability_index: number;
  avg_energy_sent_out: number;
  gas_utilization: number;
  load_factor: number;
  gas_loss: number;
  ncc_loss: number;
  internal_loss: number;
}

export interface Turbine {
  id: number;
  name: string;
  capacity: number;
}

export type DateRangeOption =
  | "week"
  | "month"
  | "3month"
  | "6month"
  | "year"
  | "custom";

export const DATE_RANGE_OPTIONS = [
  { value: "week", label: "Last Week" },
  { value: "month", label: "Last Month" },
  { value: "3month", label: "Last 3 Months" },
  { value: "6month", label: "Last 6 Months" },
  { value: "year", label: "Last Year" },
  { value: "custom", label: "Custom Range" },
] as const;

export type ExportDateRangeOption = DateRangeOption | "all";

export const EXPORT_DATE_RANGE_OPTIONS = [
  { value: "all", label: "All Time" },
  ...DATE_RANGE_OPTIONS,
] as const;

export interface ChartGroup {
  title: string;
  description?: string;
  charts: ChartConfig[];
}

export interface ChartConfig {
  title: string;
  description?: string;
  metrics: {
    key: keyof DailyData;
    label: string;
    color: string;
  }[];
  unit: string;
}

export const CHART_GROUPS: ChartGroup[] = [
  {
    title: "Energy and Gas",
    charts: [
      {
        title: "Energy Generated vs Exported",
        description: "Comparison of energy generated and exported",
        metrics: [
          {
            key: "energy_generated",
            label: "Energy Generated",
            color: "var(--color-chart-1)",
          },
          {
            key: "energy_exported",
            label: "Energy Exported",
            color: "var(--color-chart-10)",
          },
        ],
        unit: "MWH",
      },
      {
        title: "Energy Consumed",
        metrics: [
          {
            key: "energy_consumed",
            label: "Energy Consumed",
            color: "var(--color-chart-3)",
          },
        ],
        unit: "MWH",
      },
      {
        title: "Availability Forecast",
        metrics: [
          {
            key: "availability_forecast",
            label: "Availability Forecast",
            color: "var(--color-chart-1)",
          },
        ],
        unit: "MWH",
      },
      {
        title: "AVG Energy Generated",
        metrics: [
          {
            key: "avg_energy_sent_out",
            label: "AVG Energy Generated",
            color: "var(--color-chart-2)",
          },
        ],
        unit: "MWH",
      },
    ],
  },
  {
    title: "MW",
    charts: [
      {
        title: "Availability Capacity",
        metrics: [
          {
            key: "availability_capacity",
            label: "Availability Capacity",
            color: "var(--color-chart-3)",
          },
        ],
        unit: "MW",
      },
    ],
  },
  {
    title: "KPI",
    charts: [
      {
        title: "Load Factor",
        metrics: [
          {
            key: "dependability_index",
            label: "Load Factor",
            color: "var(--color-chart-1)",
          },
        ],
        unit: "%",
      },
      {
        title: "Availability Factor",
        metrics: [
          {
            key: "availability_factor",
            label: "Availability Factor",
            color: "var(--color-chart-2)",
          },
        ],
        unit: "%",
      },
      {
        title: "Thermal Efficiency",
        metrics: [
          {
            key: "thermal_efficiency",
            label: "Thermal Efficiency",
            color: "var(--color-chart-3)",
          },
        ],
        unit: "%",
      },
      {
        title: "Station Utilization Factor",
        metrics: [
          {
            key: "load_factor",
            label: "Station Utilization Factor",
            color: "var(--color-chart-1)",
          },
        ],
        unit: "%",
      },
    ],
  },
  {
    title: "Gas Metrics",
    charts: [
      {
        title: "Gas Consumed",
        metrics: [
          {
            key: "gas_consumed",
            label: "Gas Consumed",
            color: "var(--color-chart-2)",
          },
        ],
        unit: "MMSCF",
      },
      {
        title: "Gas Utilization",
        metrics: [
          {
            key: "gas_utilization",
            label: "Gas Utilization",
            color: "var(--color-chart-3)",
          },
        ],
        unit: "MWH/MMSCF",
      },
      {
        title: "Plant Heat Rate",
        metrics: [
          {
            key: "plant_heat_rate",
            label: "Plant Heat Rate",
            color: "var(--color-chart-1)",
          },
        ],
        unit: "KJ/KWH",
      },
    ],
  },
  {
    title: "Losses",
    charts: [
      {
        title: "Loss Analysis",
        description: "Comparison of different types of losses",
        metrics: [
          { key: "gas_loss", label: "Gas Loss", color: "var(--color-chart-1)" },
          { key: "ncc_loss", label: "NCC Loss", color: "var(--color-chart-10)" },
          {
            key: "internal_loss",
            label: "Internal Loss",
            color: "var(--color-chart-11)",
          },
        ],
        unit: "MWH",
      },
    ],
  },
];
