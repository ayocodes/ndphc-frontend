// src/library/hooks/useDailyReportForm.ts
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { useDailyReportStore } from "@/library/store/daily-report-store";
import { usePowerPlantStore } from "@/library/store/power-plant-store";
import {
  TurbineDailyStats,
  HourlyGeneration,
} from "@/library/types/daily-report";

interface UseDailyReportFormProps {
  powerPlantId: number;
  reportId?: string;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  setValue: Function;
  reset: Function;
  watch: Function;
  setFormMode: (mode: "create" | "update") => void;
}

export function useDailyReportForm({
  powerPlantId,
  reportId,
  selectedDate,
  setSelectedDate,
  setValue,
  reset,
  watch,
  setFormMode,
}: UseDailyReportFormProps) {
  const { turbines } = usePowerPlantStore();
  const { currentReport, isLoading, fetchDailyReport, resetState } =
    useDailyReportStore();

  // Watch turbine stats to calculate totals
  const turbineStats = watch("turbine_stats");

  // Get current plant's turbines
  const plantTurbines = turbines[powerPlantId] || [];

  // Calculate total energy generated and exported
  const totalEnergyGenerated =
    turbineStats?.reduce(
      (sum: any, turbine: { energy_generated: any }) =>
        sum + (turbine.energy_generated || 0),
      0
    ) || 0;

  const totalEnergyExported =
    turbineStats?.reduce(
      (sum: any, turbine: { energy_exported: any }) =>
        sum + (turbine.energy_exported || 0),
      0
    ) || 0;

  /**
   * Initialize turbine stats with default values
   */
  const initializeTurbineStats = (plantTurbines: any[]) => {
    const stats: TurbineDailyStats[] = plantTurbines.map((turbine) => ({
      turbine_id: turbine.id,
      energy_generated: 0,
      energy_exported: 0,
      operating_hours: 0,
      startup_count: 0,
      shutdown_count: 0,
      trips: 0,
      hourly_generations: Array.from({ length: 24 }, (_, i) => ({
        hour: i + 1, // Hours 1-24
        energy_generated: 0,
        energy_exported: 0,
      })),
    }));

    setValue("turbine_stats", stats);
  };

  /**
   * Load report data into the form
   */
  const loadReportData = (id?: string) => {
    if (currentReport) {
      // Set form values from current report
      reset({
        date: currentReport.date,
        power_plant_id: currentReport.power_plant_id,
        energy_exported: currentReport.energy_exported,
        gas_loss: currentReport.gas_loss,
        ncc_loss: currentReport.ncc_loss,
        internal_loss: currentReport.internal_loss,
        gas_consumed: currentReport.gas_consumed,
        declaration_total: currentReport.declaration_total,
        availability_capacity: currentReport.availability_capacity,
        turbine_stats: [],
      });

      // Process turbine stats and hourly readings
      if (currentReport.turbine_stats && currentReport.hourly_readings) {
        const turbineStats = currentReport.turbine_stats.map((stat: any) => {
          // Find hourly readings for this turbine
          const hourlyGens = currentReport.hourly_readings.filter(
            (g: any) => g.turbine_id === stat.turbine_id
          );

          return {
            turbine_id: stat.turbine_id,
            energy_generated: stat.energy_generated,
            energy_exported: stat.energy_exported,
            operating_hours: stat.operating_hours,
            startup_count: stat.startup_count,
            shutdown_count: stat.shutdown_count,
            trips: stat.trips || 0,
            hourly_generations: hourlyGens.map((g: any) => ({
              hour: g.hour,
              energy_generated: g.energy_generated,
              energy_exported: g.energy_exported,
            })),
          };
        });

        setValue("turbine_stats", turbineStats);
      }

      // If we found a report in create mode, notify user they're viewing existing data
      if (!id && !reportId) {
        setFormMode("update");
        toast.success("Loaded existing report for this date");
      }
    }
  };

  /**
   * Fetch report for the selected date
   */
  const fetchReportForDate = async () => {
    if (selectedDate) {
      try {
        await fetchDailyReport(powerPlantId, selectedDate);
        if (currentReport) {
          toast.error("A report already exists for this date");
          setFormMode("update");
        } else {
          setFormMode("create");
          resetState();
        }
      } catch (error) {
        // No existing report, which is what we want for creating a new one
        setFormMode("create");
        resetState();
      }
    }
  };

  /**
   * Handle date change
   */
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setValue("date", format(date, "yyyy-MM-dd"));

      // If we're in create mode, check if a report exists for this date
      if (!reportId) {
        fetchReportForDate();
      }
    }
  };

  return {
    plantTurbines,
    totalEnergyGenerated,
    totalEnergyExported,
    initializeTurbineStats,
    loadReportData,
    fetchReportForDate,
    handleDateChange,
  };
}
