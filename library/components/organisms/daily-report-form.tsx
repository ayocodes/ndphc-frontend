// src/components/organisms/daily-report-form.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { DatePicker } from "@/library/components/molecules/date-picker";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/library/components/atoms/card";
import { Button } from "@/library/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/library/components/atoms/dialog";
import { usePowerPlantStore } from "@/library/store/power-plant-store";
import { useDailyReportStore } from "@/library/store/daily-report-store";
import { useAuthStore } from "@/library/store/auth-store";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import {
  InitialDailyReportCreate,
  DailyReportUpdate,
  InitialTurbineStatData,
} from "@/library/types/daily-report";

// Import our reusable components (these would be in separate files)
import { FormSection } from "@/library/components/molecules/form-section";
import { FormField } from "@/library/components/molecules/form-field";
import { TurbineMetricsGrid } from "@/library/components/molecules/turbine-metrics-grid";

import {
  Calendar,
  Fuel,
  Zap,
  TrendingDown,
  CheckCircle2,
  Clock,
  FileText,
  Activity,
  Power,
  AlertTriangle,
  AlertCircle,
  Settings,
} from "lucide-react";

interface DailyReportFormProps {
  powerPlantId: number;
}

interface FormData {
  date: string;
  power_plant_id: number;
  gas_loss: number;
  ncc_loss: number;
  internal_loss: number;
  gas_consumed: number;
  declaration_total: number;
  availability_capacity: number;
  initial_turbine_stats: InitialTurbineStatData[];
}

export function DailyReportForm({ powerPlantId }: DailyReportFormProps) {
  const { user } = useAuthStore();
  const { fetchTurbinesForPlant, turbines } = usePowerPlantStore();
  const {
    isLoading,
    currentReport,
    createDailyReport,
    updateDailyReport,
    fetchDailyReport,
  } = useDailyReportStore();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [dataToSubmit, setDataToSubmit] = useState<
    InitialDailyReportCreate | DailyReportUpdate | null
  >(null);

  const isEditor = user?.role === "editor";
  const isUpdateMode = !!currentReport;

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      power_plant_id: powerPlantId,
      gas_loss: 0,
      ncc_loss: 0,
      internal_loss: 0,
      gas_consumed: 0,
      declaration_total: 0,
      availability_capacity: 0,
      initial_turbine_stats: [],
    },
  });

  // Deadline logic functions
  const isPastDeadline = () => {
    if (!currentReport?.submission_deadline) return false;
    const deadline = new Date(currentReport.submission_deadline);
    return new Date() > deadline;
  };

  const isFormEditable = () => {
    if (!currentReport) return true; // New report is always editable
    if (isEditor) return true; // Editors can always edit
    if (isPastDeadline()) return false; // Past deadline = not editable for non-editors
    return true; // Within deadline = editable
  };

  // Load turbines for the power plant
  useEffect(() => {
    fetchTurbinesForPlant(powerPlantId);
  }, [powerPlantId, fetchTurbinesForPlant]);

  // Fetch or initialize daily report when date changes
  useEffect(() => {
    const loadDailyReport = async () => {
      try {
        await fetchDailyReport(powerPlantId, selectedDate);
      } catch (error) {
        // Report doesn't exist for this date - that's fine
      }
    };
    loadDailyReport();
  }, [powerPlantId, selectedDate, fetchDailyReport]);

  // Initialize/update initial_turbine_stats when turbines or currentReport changes
  useEffect(() => {
    const plantTurbines = turbines[powerPlantId] || [];
    if (isUpdateMode && currentReport?.turbine_stats) {
      // Update mode: Populate from currentReport.turbine_stats
      const stats: InitialTurbineStatData[] = plantTurbines.map((turbine) => {
        const existingStat = currentReport.turbine_stats.find(
          (s) => s.turbine_id === turbine.id
        );
        return {
          turbine_id: turbine.id,
          energy_generated: existingStat?.energy_generated || 0,
          energy_exported: existingStat?.energy_exported || 0,
          operating_hours: existingStat?.operating_hours || 0,
          startup_count: existingStat?.startup_count || 0,
          shutdown_count: existingStat?.shutdown_count || 0,
          trips: existingStat?.trips || 0,
        };
      });
      setValue("initial_turbine_stats", stats);
    } else if (!isUpdateMode && plantTurbines.length > 0) {
      // Create mode: Initialize with default values for all plant turbines
      const stats: InitialTurbineStatData[] = plantTurbines.map((turbine) => ({
        turbine_id: turbine.id,
        energy_generated: 0,
        energy_exported: 0,
        operating_hours: 0,
        startup_count: 0,
        shutdown_count: 0,
        trips: 0,
      }));
      setValue("initial_turbine_stats", stats);
    }
  }, [turbines, powerPlantId, setValue, isUpdateMode, currentReport]);

  // Update form with general report data when currentReport changes
  useEffect(() => {
    if (currentReport) {
      reset({
        date: currentReport.date,
        power_plant_id: currentReport.power_plant_id,
        gas_loss: currentReport.gas_loss || 0,
        ncc_loss: currentReport.ncc_loss || 0,
        internal_loss: currentReport.internal_loss || 0,
        gas_consumed: currentReport.gas_consumed || 0,
        declaration_total: currentReport.declaration_total || 0,
        availability_capacity: currentReport.availability_capacity || 0,
        initial_turbine_stats: (currentReport.turbine_stats || []).map(
          (stat) => ({
            turbine_id: stat.turbine_id,
            energy_generated: stat.energy_generated || 0,
            energy_exported: stat.energy_exported || 0,
            operating_hours: stat.operating_hours || 0,
            startup_count: stat.startup_count || 0,
            shutdown_count: stat.shutdown_count || 0,
            trips: stat.trips || 0,
          })
        ),
      });
    } else {
      // Reset to default if no currentReport
      const plantTurbines = turbines[powerPlantId] || [];
      reset({
        date: format(selectedDate, "yyyy-MM-dd"),
        power_plant_id: powerPlantId,
        gas_loss: 0,
        ncc_loss: 0,
        internal_loss: 0,
        gas_consumed: 0,
        declaration_total: 0,
        availability_capacity: 0,
        initial_turbine_stats: plantTurbines.map((turbine) => ({
          turbine_id: turbine.id,
          energy_generated: 0,
          energy_exported: 0,
          operating_hours: 0,
          startup_count: 0,
          shutdown_count: 0,
          trips: 0,
        })),
      });
    }
  }, [currentReport, reset, setValue, selectedDate, powerPlantId, turbines]);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setValue("date", format(date, "yyyy-MM-dd"));
    }
  };

  const onReview = (data: FormData) => {
    if (isUpdateMode && currentReport) {
      const plantTurbines = turbines[powerPlantId] || [];

      const turbineStats = data.initial_turbine_stats.map((stat, index) => {
        const turbineId = plantTurbines[index]?.id;
        return {
          turbine_id: turbineId,
          energy_generated: stat.energy_generated || 0,
          energy_exported: stat.energy_exported || 0,
          operating_hours: stat.operating_hours || 0,
          startup_count: stat.startup_count || 0,
          shutdown_count: stat.shutdown_count || 0,
          trips: stat.trips || 0,
        };
      });

      const updatePayload: DailyReportUpdate = {
        gas_loss: data.gas_loss || 0,
        ncc_loss: data.ncc_loss || 0,
        internal_loss: data.internal_loss || 0,
        gas_consumed: data.gas_consumed || 0,
        declaration_total: data.declaration_total || 0,
        availability_capacity: data.availability_capacity || 0,
        turbine_stats: turbineStats,
      };
      setDataToSubmit(updatePayload);
    } else {
      const createPayload: InitialDailyReportCreate = {
        date: data.date,
        power_plant_id: data.power_plant_id,
        gas_loss: data.gas_loss || 0,
        ncc_loss: data.ncc_loss || 0,
        internal_loss: data.internal_loss || 0,
        gas_consumed: data.gas_consumed || 0,
        declaration_total: data.declaration_total || 0,
        availability_capacity: data.availability_capacity || 0,
        initial_turbine_stats: data.initial_turbine_stats.map(
          (stat, index) => ({
            turbine_id: turbines[powerPlantId][index]?.id,
            energy_generated: stat.energy_generated || 0,
            energy_exported: stat.energy_exported || 0,
            operating_hours: stat.operating_hours || 0,
            startup_count: stat.startup_count || 0,
            shutdown_count: stat.shutdown_count || 0,
            trips: stat.trips || 0,
          })
        ),
      };
      setDataToSubmit(createPayload);
    }
    setShowConfirmationModal(true);
  };

  const handleFinalSubmit = async () => {
    if (!dataToSubmit) return;

    try {
      if (isUpdateMode && currentReport) {
        await updateDailyReport(
          currentReport.id,
          dataToSubmit as DailyReportUpdate
        );
        toast.success("Daily report updated successfully");
      } else {
        await createDailyReport(dataToSubmit as InitialDailyReportCreate);
        toast.success("Daily report created successfully");
      }
      setShowConfirmationModal(false);
      setDataToSubmit(null);
    } catch (error: any) {
      // Extract proper error message
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        "An error occurred during submission";
      toast.error(errorMessage);
    }
  };

  const plantTurbines = turbines[powerPlantId] || [];
  const hasActiveReport = !!currentReport;
  const pastDeadline = isPastDeadline();
  const formEditable = isFormEditable();
  const deadlineMessage = pastDeadline
    ? "Submission deadline has passed. Only editors can update."
    : currentReport?.submission_deadline
    ? `Deadline: ${new Date(
        currentReport.submission_deadline
      ).toLocaleString()}`
    : "";

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <div className="mt-2 text-gray-600 font-medium">
              Loading report data...
            </div>
            <div className="text-sm text-gray-500">
              Please wait while we fetch the daily report
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onReview)} className="space-y-6">
          {/* Date Selection Card */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Report Date</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <DatePicker
                    selected={selectedDate}
                    onSelect={handleDateChange}
                    disabled={isLoading}
                  />

                  {hasActiveReport && (
                    <div
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                        pastDeadline
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {deadlineMessage}
                      </span>
                    </div>
                  )}

                  {!hasActiveReport && (
                    <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        No daily report for this date. One will be created if
                        you save.
                      </span>
                    </div>
                  )}
                </div>

                {hasActiveReport ? (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Editing Existing Report
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Creating New Report
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Gas Consumption Section */}
          <FormSection
            title="Gas Consumption"
            icon={Fuel}
            description="Record gas consumption for the reporting period"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Gas Consumed"
                name="gas_consumed"
                control={control}
                unit="MMSCF"
                required
                disabled={isLoading || !formEditable}
                rules={{ required: "Gas consumed is required" }}
                errors={errors}
              />
            </div>
          </FormSection>

          {/* Power Generation Section */}
          <FormSection
            title="Power Generation"
            icon={Zap}
            description="Plant capacity declarations and availability"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Declaration Total"
                name="declaration_total"
                control={control}
                unit="MW"
                disabled={isLoading || !formEditable}
              />
              <FormField
                label="Availability Capacity"
                name="availability_capacity"
                control={control}
                unit="MW"
                disabled={isLoading || !formEditable}
              />
            </div>
          </FormSection>

          {/* Energy Losses Section */}
          <FormSection
            title="Energy Losses"
            icon={TrendingDown}
            description="Record various energy losses during the reporting period"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                label="Gas Loss"
                name="gas_loss"
                control={control}
                unit="MWh"
                required
                disabled={isLoading || !formEditable}
                rules={{ required: "Gas loss is required" }}
                errors={errors}
              />
              <FormField
                label="NCC Loss"
                name="ncc_loss"
                control={control}
                unit="MWh"
                required
                disabled={isLoading || !formEditable}
                rules={{ required: "NCC loss is required" }}
                errors={errors}
              />
              <FormField
                label="Internal Loss"
                name="internal_loss"
                control={control}
                unit="MWh"
                required
                disabled={isLoading || !formEditable}
                rules={{ required: "Internal loss is required" }}
                errors={errors}
              />
            </div>
          </FormSection>

          {/* Hidden fields for turbine IDs */}
          {plantTurbines.map((turbine, index) => (
            <Controller
              key={`hidden-turbine-id-${turbine.id}`}
              name={`initial_turbine_stats.${index}.turbine_id`}
              control={control}
              defaultValue={turbine.id}
              render={({ field }) => <input type="hidden" {...field} />}
            />
          ))}

          {/* Turbine Metrics Sections */}
          <TurbineMetricsGrid
            title="Energy Generated"
            fieldPrefix="energy_generated"
            unit="MWh"
            turbines={plantTurbines}
            control={control}
            disabled={isLoading || !formEditable}
            description="Energy generated by each turbine during the reporting period"
          />

          <TurbineMetricsGrid
            title="Energy Exported"
            fieldPrefix="energy_exported"
            unit="MWh"
            turbines={plantTurbines}
            control={control}
            disabled={isLoading || !formEditable}
            description="Energy exported by each turbine to the grid"
          />

          <TurbineMetricsGrid
            title="Operating Hours"
            fieldPrefix="operating_hours"
            unit="hrs"
            turbines={plantTurbines}
            control={control}
            disabled={isLoading || !formEditable}
            description="Total operational hours for each turbine"
          />

          <TurbineMetricsGrid
            title="Startup Count"
            fieldPrefix="startup_count"
            unit="count"
            turbines={plantTurbines}
            control={control}
            disabled={isLoading || !formEditable}
            type="integer"
            description="Total number of startups during the reporting period"
          />

          <TurbineMetricsGrid
            title="Shutdown Count"
            fieldPrefix="shutdown_count"
            unit="count"
            turbines={plantTurbines}
            control={control}
            disabled={isLoading || !formEditable}
            type="integer"
            description="Total number of shutdowns during the reporting period"
          />

          <TurbineMetricsGrid
            title="Trips"
            fieldPrefix="trips"
            unit="count"
            turbines={plantTurbines}
            control={control}
            disabled={isLoading || !formEditable}
            type="integer"
            description="Total number of trips during the reporting period"
          />

          {/* Action Bar */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Status:</span>{" "}
                  {!hasActiveReport
                    ? "New report will be created"
                    : pastDeadline && !isEditor
                    ? "Past deadline - Read only"
                    : "Ready to update"}
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      !hasActiveReport
                        ? "bg-yellow-500"
                        : pastDeadline && !isEditor
                        ? "bg-red-500"
                        : "bg-green-500"
                    }`}
                  ></div>
                  <span
                    className={`text-sm font-medium ${
                      !hasActiveReport
                        ? "text-yellow-600"
                        : pastDeadline && !isEditor
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {!hasActiveReport
                      ? "Creating new"
                      : pastDeadline && !isEditor
                      ? "Read only"
                      : "Editable"}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={
                  isLoading || (!isEditor && pastDeadline && hasActiveReport)
                }
                className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
              >
                {isLoading ? (
                  <>
                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Review Submission
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Enhanced Confirmation Modal */}
      <Dialog
        open={showConfirmationModal}
        onOpenChange={setShowConfirmationModal}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-xl">
              <CheckCircle2 className="h-6 w-6 text-blue-600" />
              <span>Confirm Daily Report Submission</span>
            </DialogTitle>
            <DialogDescription>
              Please review all information before submitting the daily report.
            </DialogDescription>
          </DialogHeader>

          {dataToSubmit && (
            <div className="py-6 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Fuel className="h-5 w-5 text-orange-600" />
                      <div>
                        <div className="text-sm text-gray-500">
                          Gas Consumed
                        </div>
                        <div className="font-semibold text-gray-900">
                          {dataToSubmit.gas_consumed} MMSCF
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Zap className="h-5 w-5 text-yellow-600" />
                      <div>
                        <div className="text-sm text-gray-500">
                          Declaration Total
                        </div>
                        <div className="font-semibold text-gray-900">
                          {dataToSubmit.declaration_total} MW
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Power className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="text-sm text-gray-500">
                          Availability
                        </div>
                        <div className="font-semibold text-gray-900">
                          {dataToSubmit.availability_capacity} MW
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                      <div>
                        <div className="text-sm text-gray-500">
                          Total Losses
                        </div>
                        <div className="font-semibold text-gray-900">
                          {(
                            dataToSubmit.gas_loss +
                            dataToSubmit.ncc_loss +
                            dataToSubmit.internal_loss
                          ).toFixed(2)}{" "}
                          MWh
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Energy Losses Breakdown */}
              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center space-x-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span>Energy Losses Breakdown</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-sm text-gray-600">Gas Loss</div>
                      <div className="text-lg font-semibold text-red-700">
                        {dataToSubmit.gas_loss} MWh
                      </div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-sm text-gray-600">NCC Loss</div>
                      <div className="text-lg font-semibold text-orange-700">
                        {dataToSubmit.ncc_loss} MWh
                      </div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-sm text-gray-600">Internal Loss</div>
                      <div className="text-lg font-semibold text-yellow-700">
                        {dataToSubmit.internal_loss} MWh
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Turbine Statistics */}
              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-purple-600" />
                    <span>Turbine Statistics Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(
                    (dataToSubmit as any).turbine_stats ||
                    (dataToSubmit as any).initial_turbine_stats
                  )?.length > 0 ? (
                    <div className="space-y-4">
                      {/* Summary totals */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <div className="text-sm text-gray-600">
                            Total Energy Generated
                          </div>
                          <div className="text-lg font-semibold text-blue-700">
                            {(
                              (dataToSubmit as any).turbine_stats ||
                              (dataToSubmit as any).initial_turbine_stats
                            )
                              .reduce(
                                (sum: number, stat: any) =>
                                  sum + (stat.energy_generated || 0),
                                0
                              )
                              .toFixed(2)}{" "}
                            MWh
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">
                            Total Energy Exported
                          </div>
                          <div className="text-lg font-semibold text-green-700">
                            {(
                              (dataToSubmit as any).turbine_stats ||
                              (dataToSubmit as any).initial_turbine_stats
                            )
                              .reduce(
                                (sum: number, stat: any) =>
                                  sum + (stat.energy_exported || 0),
                                0
                              )
                              .toFixed(2)}{" "}
                            MWh
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">
                            Total Operating Hours
                          </div>
                          <div className="text-lg font-semibold text-purple-700">
                            {(
                              (dataToSubmit as any).turbine_stats ||
                              (dataToSubmit as any).initial_turbine_stats
                            )
                              .reduce(
                                (sum: number, stat: any) =>
                                  sum + (stat.operating_hours || 0),
                                0
                              )
                              .toFixed(1)}{" "}
                            hrs
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">
                            Total Startups
                          </div>
                          <div className="text-lg font-semibold text-indigo-700">
                            {(
                              (dataToSubmit as any).turbine_stats ||
                              (dataToSubmit as any).initial_turbine_stats
                            ).reduce(
                              (sum: number, stat: any) =>
                                sum + (stat.startup_count || 0),
                              0
                            )}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">
                            Total Trips
                          </div>
                          <div className="text-lg font-semibold text-red-700">
                            {(
                              (dataToSubmit as any).turbine_stats ||
                              (dataToSubmit as any).initial_turbine_stats
                            ).reduce(
                              (sum: number, stat: any) =>
                                sum + (stat.trips || 0),
                              0
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Individual turbine details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(
                          (dataToSubmit as any).turbine_stats ||
                          (dataToSubmit as any).initial_turbine_stats
                        ).map((stat: InitialTurbineStatData, index: number) => {
                          const turbineName =
                            plantTurbines.find((t) => t.id === stat.turbine_id)
                              ?.name || `Turbine ID: ${stat.turbine_id}`;
                          const hasData =
                            stat.energy_generated > 0 ||
                            stat.energy_exported > 0 ||
                            stat.operating_hours > 0;

                          return (
                            <Card
                              key={index}
                              className={`border ${
                                hasData
                                  ? "border-blue-200 bg-blue-50"
                                  : "border-gray-200"
                              }`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-2 mb-3">
                                  <div
                                    className={`w-3 h-3 rounded-full ${
                                      hasData ? "bg-blue-500" : "bg-gray-300"
                                    }`}
                                  ></div>
                                  <span className="font-medium text-gray-900">
                                    {turbineName}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <span className="text-gray-600">
                                      Generated:{" "}
                                    </span>
                                    <span className="font-medium">
                                      {stat.energy_generated} MWh
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">
                                      Exported:{" "}
                                    </span>
                                    <span className="font-medium">
                                      {stat.energy_exported} MWh
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">
                                      Operating:{" "}
                                    </span>
                                    <span className="font-medium">
                                      {stat.operating_hours} hrs
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">
                                      Startups:{" "}
                                    </span>
                                    <span className="font-medium">
                                      {stat.startup_count}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">
                                      Shutdowns:{" "}
                                    </span>
                                    <span className="font-medium">
                                      {stat.shutdown_count}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">
                                      Trips:{" "}
                                    </span>
                                    <span
                                      className={`font-medium ${
                                        stat.trips > 0 ? "text-red-600" : ""
                                      }`}
                                    >
                                      {stat.trips}
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                      <span>No turbine statistics provided</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter className="space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmationModal(false)}
              disabled={isLoading}
              className="px-6"
            >
              Back to Edit
            </Button>
            <Button
              onClick={handleFinalSubmit}
              disabled={isLoading}
              className="px-6 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {isUpdateMode ? "Update Report" : "Create Report"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
