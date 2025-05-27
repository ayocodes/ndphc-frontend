export const VALID_METRICS = [
  { key: "energy_generated", label: "Energy Generated", unit: "MWh" },
  { key: "total_energy_exported", label: "Energy Exported", unit: "MWh" },
  { key: "energy_consumed", label: "Energy Consumed", unit: "MWh" },
  { key: "gas_consumed", label: "Gas Consumed", unit: "MSCM" },
  { key: "availability_factor", label: "Availability Factor", unit: "%" },
  { key: "plant_heat_rate", label: "Plant Heat Rate", unit: "kJ/kWh" },
  { key: "thermal_efficiency", label: "Thermal Efficiency", unit: "%" },
  { key: "dependability_index", label: "Dependability Index", unit: "%" },
  { key: "avg_energy_sent_out", label: "Avg Energy Sent Out", unit: "MW" },
  { key: "gas_utilization", label: "Gas Utilization", unit: "MWh/MSCM" },
  { key: "load_factor", label: "Load Factor", unit: "%" },
];

// Power plant color palette
export const POWER_PLANT_COLORS = [
  "var(--color-chart-1)", // Orange/red
  "var(--color-chart-2)", // Teal
  "var(--color-chart-3)", // Blue
  "var(--color-chart-4)", // Yellow
  "var(--color-chart-5)", // Red
];

export const DEFAULT_COLOR = POWER_PLANT_COLORS[0];
