import { create } from "zustand";
import {
  AdminDashboardService,
  UsersService,
  PowerPlantsService,
  TurbinesService,
  User,
  UserCreateData,
  UserUpdateData,
  PowerPlant,
  Turbine,
  DashboardStats,
  ExportParams,
} from "../service/admin-service";

// Admin Dashboard Store
interface AdminDashboardState {
  stats: DashboardStats | null;
  powerPlants: PowerPlant[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDashboardStats: () => Promise<void>;
  exportData: (params: ExportParams) => Promise<Blob>;
  fetchPowerPlantsForExport: () => Promise<void>;
}

export const useAdminDashboardStore = create<AdminDashboardState>()(
  (set, get) => ({
    stats: null,
    powerPlants: [],
    isLoading: false,
    error: null,

    fetchDashboardStats: async () => {
      set({ isLoading: true, error: null });
      try {
        const stats = await AdminDashboardService.getDashboardStats();
        set({ stats, isLoading: false });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch dashboard statistics";
        set({
          error: errorMessage,
          isLoading: false,
        });
        throw error;
      }
    },

    exportData: async (params: ExportParams) => {
      try {
        return await AdminDashboardService.exportData(params);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to export data";
        set({ error: errorMessage });
        throw error;
      }
    },

    fetchPowerPlantsForExport: async () => {
      try {
        const powerPlants = await PowerPlantsService.getPowerPlants();
        set({ powerPlants });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch power plants";
        set({ error: errorMessage });
        throw error;
      }
    },
  })
);

// Users Store
interface UsersState {
  users: User[];
  powerPlants: PowerPlant[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchUsers: () => Promise<void>;
  fetchPowerPlants: () => Promise<void>;
  createUser: (userData: UserCreateData) => Promise<User>;
  updateUser: (userId: number, userData: UserUpdateData) => Promise<User>;
  deleteUser: (userId: number) => Promise<void>;
}

export const useUsersStore = create<UsersState>()((set, get) => ({
  users: [],
  powerPlants: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const users = await UsersService.getUsers();
      set({ users, isLoading: false });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch users";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  fetchPowerPlants: async () => {
    try {
      const powerPlants = await PowerPlantsService.getPowerPlants();
      set({ powerPlants });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch power plants";
      set({ error: errorMessage });
      throw error;
    }
  },

  createUser: async (userData: UserCreateData) => {
    try {
      const newUser = await UsersService.createUser(userData);
      const { users } = get();
      set({ users: [...users, newUser] });
      return newUser;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create user";
      set({ error: errorMessage });
      throw error;
    }
  },

  updateUser: async (userId: number, userData: UserUpdateData) => {
    try {
      const updatedUser = await UsersService.updateUser(userId, userData);
      const { users } = get();
      set({
        users: users.map((user) => (user.id === userId ? updatedUser : user)),
      });
      return updatedUser;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update user";
      set({ error: errorMessage });
      throw error;
    }
  },

  deleteUser: async (userId: number) => {
    try {
      await UsersService.deleteUser(userId);
      const { users } = get();
      set({ users: users.filter((user) => user.id !== userId) });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete user";
      set({ error: errorMessage });
      throw error;
    }
  },
}));

// Power Plants Store
interface PowerPlantsState {
  powerPlants: PowerPlant[];
  expandedPlant: number | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPowerPlants: () => Promise<void>;
  fetchPlantDetails: (plantId: number) => Promise<void>;
  createPowerPlant: (
    plantData: Omit<PowerPlant, "id" | "turbine_count">
  ) => Promise<PowerPlant>;
  updatePowerPlant: (
    plantId: number,
    plantData: Partial<PowerPlant>
  ) => Promise<PowerPlant>;
  deletePowerPlant: (plantId: number) => Promise<void>;
  setExpandedPlant: (plantId: number | null) => void;

  // Turbine actions
  createTurbine: (
    plantId: number,
    turbineData: Omit<Turbine, "id" | "power_plant_id">
  ) => Promise<Turbine>;
  updateTurbine: (
    turbineId: number,
    turbineData: Partial<Turbine>
  ) => Promise<Turbine>;
  deleteTurbine: (turbineId: number, plantId: number) => Promise<void>;
}

export const usePowerPlantsStore = create<PowerPlantsState>()((set, get) => ({
  powerPlants: [],
  expandedPlant: null,
  isLoading: false,
  error: null,

  fetchPowerPlants: async () => {
    set({ isLoading: true, error: null });
    try {
      const powerPlants = await PowerPlantsService.getPowerPlants();
      set({ powerPlants, isLoading: false });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch power plants";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  fetchPlantDetails: async (plantId: number) => {
    try {
      const plantDetails = await PowerPlantsService.getPowerPlantDetails(
        plantId
      );
      const { powerPlants } = get();
      set({
        powerPlants: powerPlants.map((plant) =>
          plant.id === plantId
            ? { ...plant, turbines: plantDetails.turbines }
            : plant
        ),
        expandedPlant: plantId,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch plant details";
      set({ error: errorMessage });
      throw error;
    }
  },

  createPowerPlant: async (
    plantData: Omit<PowerPlant, "id" | "turbine_count">
  ) => {
    try {
      const newPlant = await PowerPlantsService.createPowerPlant(plantData);
      const { powerPlants } = get();
      const plantWithTurbines = { ...newPlant, turbines: [] };
      set({ powerPlants: [...powerPlants, plantWithTurbines] });
      return newPlant;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create power plant";
      set({ error: errorMessage });
      throw error;
    }
  },

  updatePowerPlant: async (plantId: number, plantData: Partial<PowerPlant>) => {
    try {
      const updatedPlant = await PowerPlantsService.updatePowerPlant(
        plantId,
        plantData
      );
      const { powerPlants } = get();
      set({
        powerPlants: powerPlants.map((plant) =>
          plant.id === plantId
            ? { ...updatedPlant, turbines: plant.turbines }
            : plant
        ),
      });
      return updatedPlant;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update power plant";
      set({ error: errorMessage });
      throw error;
    }
  },

  deletePowerPlant: async (plantId: number) => {
    try {
      await PowerPlantsService.deletePowerPlant(plantId);
      const { powerPlants } = get();
      set({ powerPlants: powerPlants.filter((plant) => plant.id !== plantId) });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete power plant";
      set({ error: errorMessage });
      throw error;
    }
  },

  setExpandedPlant: (plantId: number | null) => {
    set({ expandedPlant: plantId });
  },

  // Turbine actions
  createTurbine: async (
    plantId: number,
    turbineData: Omit<Turbine, "id" | "power_plant_id">
  ) => {
    try {
      const newTurbine = await TurbinesService.createTurbine(
        plantId,
        turbineData
      );
      const { powerPlants } = get();
      set({
        powerPlants: powerPlants.map((plant) => {
          if (plant.id === plantId) {
            const updatedTurbines = plant.turbines
              ? [...plant.turbines, newTurbine]
              : [newTurbine];
            return { ...plant, turbines: updatedTurbines };
          }
          return plant;
        }),
      });
      return newTurbine;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create turbine";
      set({ error: errorMessage });
      throw error;
    }
  },

  updateTurbine: async (turbineId: number, turbineData: Partial<Turbine>) => {
    try {
      const updatedTurbine = await TurbinesService.updateTurbine(
        turbineId,
        turbineData
      );
      const { powerPlants } = get();
      set({
        powerPlants: powerPlants.map((plant) => {
          if (plant.turbines) {
            const updatedTurbines = plant.turbines.map((turbine) =>
              turbine.id === turbineId ? updatedTurbine : turbine
            );
            return { ...plant, turbines: updatedTurbines };
          }
          return plant;
        }),
      });
      return updatedTurbine;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update turbine";
      set({ error: errorMessage });
      throw error;
    }
  },

  deleteTurbine: async (turbineId: number, plantId: number) => {
    try {
      await TurbinesService.deleteTurbine(turbineId);
      const { powerPlants } = get();
      set({
        powerPlants: powerPlants.map((plant) => {
          if (plant.id === plantId && plant.turbines) {
            const updatedTurbines = plant.turbines.filter(
              (turbine) => turbine.id !== turbineId
            );
            return { ...plant, turbines: updatedTurbines };
          }
          return plant;
        }),
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete turbine";
      set({ error: errorMessage });
      throw error;
    }
  },
}));
