// src/store/powerPlantStore.ts
import { create } from 'zustand';
import axios from '../api/axios';
import { PowerPlant, TurbineInPowerPlant, PowerPlantWithTurbines } from '../types/power-plant';
import { useAuthStore } from './auth-store';

interface PowerPlantState {
  powerPlants: PowerPlant[];
  selectedPlantId: number | null;
  turbines: Record<number, TurbineInPowerPlant[]>; // Key is power plant ID
  isLoading: boolean;
  error: string | null;
  fetchPowerPlants: () => Promise<void>;
  fetchTurbinesForPlant: (powerPlantId: number) => Promise<void>;
  selectPowerPlant: (id: number) => void;
}

export const usePowerPlantStore = create<PowerPlantState>()((set, get) => ({
  powerPlants: [],
  selectedPlantId: null,
  turbines: {},
  isLoading: false,
  error: null,
  
  fetchPowerPlants: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get<PowerPlant[]>('/api/v1/power-plants/');
      
      // Get the user's power plant ID from the auth store if available
      const userPowerPlantId = useAuthStore.getState().user?.power_plant_id;
      
      set({ 
        powerPlants: response.data, 
        isLoading: false,
        // If user has a power plant assigned, select it as default
        // Otherwise, use the previously selected plant or the first plant
        selectedPlantId: userPowerPlantId || 
                        get().selectedPlantId || 
                        (response.data.length > 0 ? response.data[0].id : null)
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch power plants' 
      });
    }
  },
  
  fetchTurbinesForPlant: async (powerPlantId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get<PowerPlantWithTurbines>(`/api/v1/power-plants/${powerPlantId}`);
      
      set(state => ({ 
        turbines: { ...state.turbines, [powerPlantId]: response.data.turbines },
        isLoading: false
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch turbines' 
      });
    }
  },
  
  selectPowerPlant: (id) => {
    set({ selectedPlantId: id });
  }
}));