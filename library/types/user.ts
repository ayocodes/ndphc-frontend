export type UserRole = 'admin' | 'operator' | 'editor' | 'viewer';

export interface User {
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean | null;
  power_plant_id: number | null;
  id: number;
  power_plant_name: string | null;
  permissions: string[];
}