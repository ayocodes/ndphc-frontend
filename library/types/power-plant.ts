// src/types/powerPlant.ts
export interface PowerPlant {
  name: string;
  location: string | null;
  total_capacity: number;
  id: number;
  turbine_count: number | null;
}

export interface TurbineInPowerPlant {
  id: number;
  name: string;
  capacity: number;
}

export interface PowerPlantWithTurbines extends PowerPlant {
  turbines: TurbineInPowerPlant[];
}