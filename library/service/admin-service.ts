import axiosInstance from "../api/axios";

// Types
export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  power_plant_id: number | null;
  is_active: boolean;
  password?: string;
}

export interface UserCreateData {
  email: string;
  full_name: string;
  password: string;
  role: string;
  is_active: boolean;
  power_plant_id: number | null;
}

export interface UserUpdateData {
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  power_plant_id: number | null;
  password?: string;
}

export interface Turbine {
  id: number;
  name: string;
  capacity: number;
  power_plant_id: number;
}

export interface PowerPlant {
  id: number;
  name: string;
  location: string;
  total_capacity: number;
  turbine_count: number;
  turbines?: Turbine[];
}

export interface RoleData {
  name: string;
  value: number;
}

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    byRole: RoleData[];
  };
  powerPlants: {
    total: number;
    totalCapacity: number;
  };
  turbines: {
    total: number;
  };
}

export interface ExportParams {
  power_plant_id?: string;
  start_date?: string;
  end_date?: string;
}

// Admin Dashboard Service
export class AdminDashboardService {
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Fetch all the needed data in parallel
      const [usersResponse, powerPlantsResponse] = await Promise.all([
        axiosInstance.get<User[]>("/api/v1/users/"),
        axiosInstance.get<PowerPlant[]>("/api/v1/power-plants/"),
      ]);

      const users = usersResponse.data;
      const powerPlants = powerPlantsResponse.data;

      // Calculate stats
      const activeUsers = users.filter((user) => user.is_active).length;

      // Count users by role
      const roleCount: Record<string, number> = {};
      users.forEach((user) => {
        if (!roleCount[user.role]) {
          roleCount[user.role] = 0;
        }
        roleCount[user.role]++;
      });

      const roleData: RoleData[] = Object.entries(roleCount).map(
        ([role, count]) => ({
          name: role.charAt(0).toUpperCase() + role.slice(1),
          value: count,
        })
      );

      // Calculate total capacity
      const totalCapacity = powerPlants.reduce(
        (sum, plant) => sum + plant.total_capacity,
        0
      );

      // Calculate total turbines
      const totalTurbines = powerPlants.reduce(
        (sum, plant) => sum + (plant.turbine_count || 0),
        0
      );

      return {
        users: {
          total: users.length,
          active: activeUsers,
          byRole: roleData,
        },
        powerPlants: {
          total: powerPlants.length,
          totalCapacity,
        },
        turbines: {
          total: totalTurbines,
        },
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  }

  static async exportData(params: ExportParams): Promise<Blob> {
    try {
      const searchParams = new URLSearchParams();

      if (params.power_plant_id && params.power_plant_id !== "all") {
        searchParams.append("power_plant_id", params.power_plant_id);
      }
      if (params.start_date) {
        searchParams.append("start_date", params.start_date);
      }
      if (params.end_date) {
        searchParams.append("end_date", params.end_date);
      }

      const response = await axiosInstance.get(
        `/api/v1/download/download?${searchParams.toString()}`,
        {
          responseType: "blob",
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error exporting data:", error);
      throw error;
    }
  }
}

// Users Service
export class UsersService {
  static async getUsers(): Promise<User[]> {
    try {
      const response = await axiosInstance.get<User[]>("/api/v1/users/");
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  static async createUser(userData: UserCreateData): Promise<User> {
    try {
      const response = await axiosInstance.post<User>(
        "/api/v1/users/",
        userData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  static async updateUser(
    userId: number,
    userData: UserUpdateData
  ): Promise<User> {
    try {
      const response = await axiosInstance.put<User>(
        `/api/v1/users/${userId}`,
        userData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  static async deleteUser(userId: number): Promise<void> {
    try {
      await axiosInstance.delete(`/api/v1/users/${userId}`);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }
}

// Power Plants Service
export class PowerPlantsService {
  static async getPowerPlants(): Promise<PowerPlant[]> {
    try {
      const response = await axiosInstance.get<PowerPlant[]>(
        "/api/v1/power-plants/"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching power plants:", error);
      throw error;
    }
  }

  static async getPowerPlantDetails(
    plantId: number
  ): Promise<PowerPlant & { turbines: Turbine[] }> {
    try {
      const response = await axiosInstance.get<
        PowerPlant & { turbines: Turbine[] }
      >(`/api/v1/power-plants/${plantId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching power plant details:", error);
      throw error;
    }
  }

  static async createPowerPlant(
    plantData: Omit<PowerPlant, "id" | "turbine_count">
  ): Promise<PowerPlant> {
    try {
      const response = await axiosInstance.post<PowerPlant>(
        "/api/v1/power-plants/",
        plantData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating power plant:", error);
      throw error;
    }
  }

  static async updatePowerPlant(
    plantId: number,
    plantData: Partial<PowerPlant>
  ): Promise<PowerPlant> {
    try {
      const response = await axiosInstance.put<PowerPlant>(
        `/api/v1/power-plants/${plantId}`,
        plantData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating power plant:", error);
      throw error;
    }
  }

  static async deletePowerPlant(plantId: number): Promise<void> {
    try {
      await axiosInstance.delete(`/api/v1/power-plants/${plantId}`);
    } catch (error) {
      console.error("Error deleting power plant:", error);
      throw error;
    }
  }
}

// Turbines Service
export class TurbinesService {
  static async createTurbine(
    plantId: number,
    turbineData: Omit<Turbine, "id" | "power_plant_id">
  ): Promise<Turbine> {
    try {
      const response = await axiosInstance.post<Turbine>(
        `/api/v1/power-plant/${plantId}/turbines`,
        turbineData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating turbine:", error);
      throw error;
    }
  }

  static async updateTurbine(
    turbineId: number,
    turbineData: Partial<Turbine>
  ): Promise<Turbine> {
    try {
      const response = await axiosInstance.put<Turbine>(
        `/api/v1/turbines/${turbineId}`,
        turbineData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating turbine:", error);
      throw error;
    }
  }

  static async deleteTurbine(turbineId: number): Promise<void> {
    try {
      await axiosInstance.delete(`/api/v1/turbines/${turbineId}`);
    } catch (error) {
      console.error("Error deleting turbine:", error);
      throw error;
    }
  }
}
