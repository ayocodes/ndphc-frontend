// src/types/morning-reading.ts

/**
 * Base interface for hourly declarations
 */
export interface HourlyDeclarationBase {
  hour: number; // 1-24
  declared_output: number; // MW
}

/**
 * Interface for creating hourly declarations
 */
export interface HourlyDeclarationCreate extends HourlyDeclarationBase {}

/**
 * Interface for hourly declaration response from API
 */
export interface HourlyDeclarationResponse extends HourlyDeclarationBase {
  id: string;
  turbine_id: number;
  morning_reading_id: string;
}

/**
 * Base interface for turbine declarations
 */
export interface TurbineDeclarationBase {
  turbine_id: number;
  hourly_declarations: HourlyDeclarationCreate[];
}

/**
 * Interface for creating turbine declarations
 */
export interface TurbineDeclarationCreate extends TurbineDeclarationBase {}

/**
 * Base interface for morning readings
 */
export interface MorningReadingBase {
  date: string;
  power_plant_id: number;
  declaration_total: number; // MW
  availability_capacity: number; // MW
}

/**
 * Interface for creating morning readings
 */
export interface MorningReadingCreate extends MorningReadingBase {
  turbine_declarations: TurbineDeclarationCreate[];
}

/**
 * Interface for updating morning readings
 * Date is excluded as it's not needed/allowed in updates
 */
export interface MorningReadingUpdate extends Omit<MorningReadingBase, 'date'> {
  turbine_declarations: TurbineDeclarationCreate[];
}

/**
 * Interface for morning reading response from API
 */
export interface MorningReadingResponse extends MorningReadingBase {
  id: string;
  user_id: number;
  submission_deadline: string | null;
  is_late_submission: boolean | null;
  last_modified_by_id: number | null;
}

/**
 * Extended interface for morning reading with declarations
 */
export interface MorningReadingWithDeclarations extends MorningReadingResponse {
  hourly_declarations: HourlyDeclarationResponse[];
}