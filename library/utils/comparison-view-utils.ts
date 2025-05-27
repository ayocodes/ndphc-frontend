import { PowerPlantResponse } from "@/library/types/dashboard";
import { POWER_PLANT_COLORS } from "./comparison-view-constants";

/**
 * Creates a mapping of power plant names to colors
 */
export const createColorMap = (
  powerPlants: PowerPlantResponse[]
): Record<string, string> => {
  const colorMap: Record<string, string> = {};
  powerPlants.forEach((plant, index) => {
    const colorIndex = index % POWER_PLANT_COLORS.length;
    colorMap[plant.name] = POWER_PLANT_COLORS[colorIndex];
  });
  return colorMap;
};

/**
 * Format number with commas for thousands
 */
export const formatNumber = (value: number): string => {
  return value.toLocaleString();
};
