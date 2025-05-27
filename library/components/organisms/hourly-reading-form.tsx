// src/components/organisms/hourly-reading-form.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, FieldPath } from "react-hook-form";
import { DatePicker } from "@/library/components/molecules/date-picker";
import { Button } from "@/library/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/library/components/atoms/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/library/components/atoms/card";
import { usePowerPlantStore } from "@/library/store/power-plant-store";
import { useDailyReportStore } from "@/library/store/daily-report-store";
import { useAuthStore } from "@/library/store/auth-store";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { useHourlyReadingStore } from "@/library/store/hourly-reading-store";
import {
  InitialDailyReportCreate,
  DailyReportWithDetails,
} from "@/library/types/daily-report";

// Import reusable components
import { FormSection } from "@/library/components/molecules/form-section";
import { TurbineHourlyTable } from "@/library/components/molecules/turbine-hourly-table";

import {
  Calendar,
  Zap,
  Clock,
  AlertCircle,
  CheckCircle2,
  Activity,
  FileText,
  Settings,
} from "lucide-react";

interface HourlyReading {
  turbine_id: number;
  hour: number;
  energy_generated: number;
  id?: string;
  daily_report_id?: string;
}

interface FormReadingValue {
  turbine_id: number;
  hour: number;
  energy_generated: number;
}

interface FormReadings {
  [key: string]: FormReadingValue;
}

interface FormData {
  readings: FormReadings;
}

interface Turbine {
  id: number;
  name: string;
}

interface HourlyReadingsUpdatePayload {
  readings: {
    turbine_id: number;
    hour: number;
    energy_generated: number;
  }[];
}

interface HourlyReadingFormProps {
  powerPlantId: number;
}

export function HourlyReadingForm({ powerPlantId }: HourlyReadingFormProps) {
  const { user } = useAuthStore();
  const { fetchTurbinesForPlant, turbines: allPlantTurbines } =
    usePowerPlantStore();
  const {
    isLoading: isReportLoading,
    currentReport,
    fetchDailyReport,
    createDailyReport,
    resetState,
  } = useDailyReportStore();
  const {
    isLoading: isUpdatingHourly,
    updateHourlyReadings,
    fetchHourlyReadings,
    hourlyReadings,
  } = useHourlyReadingStore();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [dataToSubmit, setDataToSubmit] =
    useState<HourlyReadingsUpdatePayload | null>(null);

  const isEditor = user?.role === "editor";

  const { control, handleSubmit, setValue, reset, watch } = useForm<FormData>({
    defaultValues: { readings: {} },
  });

  const formReadings = watch("readings");

  useEffect(() => {
    const plantTurbines = allPlantTurbines[powerPlantId] || [];
    const newFormReadings: FormReadings = {};

    plantTurbines.forEach((turbine) => {
      for (let hour = 1; hour <= 24; hour++) {
        const key = `${turbine.id}-${hour}`;
        newFormReadings[key] = {
          turbine_id: turbine.id,
          hour: hour,
          energy_generated: 0,
        };
      }
    });

    if (hourlyReadings && hourlyReadings.length > 0) {
      hourlyReadings.forEach((hr) => {
        const key = `${hr.turbine_id}-${hr.hour}`;
        if (newFormReadings[key]) {
          newFormReadings[key].energy_generated = hr.energy_generated;
        }
      });
    }
    reset({ readings: newFormReadings });
  }, [allPlantTurbines, powerPlantId, hourlyReadings, reset]);

  const isPastDeadline = () => {
    if (!currentReport?.submission_deadline) return false;
    const deadline = new Date(currentReport.submission_deadline);
    return new Date() > deadline;
  };

  const hasExistingReading = (turbineId: number, hour: number) => {
    return hourlyReadings.some(
      (r) =>
        r.turbine_id === turbineId && r.hour === hour && r.energy_generated > 0
    );
  };

  const isCellEditable = (turbineId: number, hour: number) => {
    if (!currentReport) return false;
    if (isEditor) return true;
    if (isPastDeadline()) return false;
    if (hasExistingReading(turbineId, hour)) return false;
    return true;
  };

  // Calculate total for a turbine by turbineIndex (for TurbineHourlyTable)
  const calculateTurbineTotal = (turbineIndex: number) => {
    const plantTurbines = allPlantTurbines[powerPlantId] || [];
    const turbine = plantTurbines[turbineIndex];
    if (!turbine || !formReadings) return 0;

    let total = 0;
    for (let hour = 1; hour <= 24; hour++) {
      const key = `${turbine.id}-${hour}`;
      if (formReadings[key]) {
        total += formReadings[key].energy_generated || 0;
      }
    }
    return total;
  };

  // Calculate total for a turbine by turbineId (for confirmation modal)
  const calculateTurbineTotalById = (turbineId: number) => {
    if (!formReadings) return 0;
    let total = 0;
    for (let hour = 1; hour <= 24; hour++) {
      const key = `${turbineId}-${hour}`;
      if (formReadings[key]) {
        total += formReadings[key].energy_generated || 0;
      }
    }
    return total;
  };

  // Calculate grand total
  const calculateGrandTotal = () => {
    const plantTurbines = allPlantTurbines[powerPlantId] || [];
    return plantTurbines.reduce(
      (sum, turbine) => sum + calculateTurbineTotalById(turbine.id),
      0
    );
  };

  // Get hourly data for a turbine (for confirmation modal)
  const getTurbineHourlyData = (turbineId: number) => {
    const hourlyData = [];
    for (let hour = 1; hour <= 24; hour++) {
      const key = `${turbineId}-${hour}`;
      hourlyData.push({
        hour,
        energy_generated: formReadings?.[key]?.energy_generated || 0,
      });
    }
    return hourlyData;
  };

  useEffect(() => {
    fetchTurbinesForPlant(powerPlantId);
  }, [powerPlantId, fetchTurbinesForPlant]);

  useEffect(() => {
    let isMounted = true;
    const setupForm = async () => {
      if (selectedDate && isMounted) {
        try {
          await fetchDailyReport(powerPlantId, selectedDate);
        } catch (error) {
          if (isMounted) {
            resetState();
          }
        }
      }
    };
    setupForm();
    return () => {
      isMounted = false;
    };
  }, [
    powerPlantId,
    selectedDate,
    fetchDailyReport,
    resetState,
    allPlantTurbines,
    reset,
  ]);

  useEffect(() => {
    let isMounted = true;
    const fetchReadings = async () => {
      if (currentReport?.id && isMounted) {
        try {
          await fetchHourlyReadings(currentReport.id);
        } catch (error) {
          if (isMounted) {
            console.error("Failed to fetch hourly readings:", error);
          }
        }
      } else if (isMounted && !currentReport?.id) {
        useHourlyReadingStore.getState().resetState();
      }
    };
    fetchReadings();
    return () => {
      isMounted = false;
    };
  }, [currentReport?.id, fetchHourlyReadings]);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  // Handle field changes in the hourly table
  const handleFieldChange = (
    turbineIndex: number,
    hourIndex: number,
    value: number,
    turbineId: number,
    hour: number
  ) => {
    // The TurbineHourlyTable already handles the field updates via Controller
    // This is just for any additional logic if needed
  };

  // Get cell styling for existing data
  const getCellClassName = (turbineIndex: number, hourIndex: number) => {
    const plantTurbines = allPlantTurbines[powerPlantId] || [];
    const turbine = plantTurbines[turbineIndex];
    if (!turbine) return "";

    const hour = hourIndex + 1;
    const cellIsEditable = currentReport
      ? isCellEditable(turbine.id, hour)
      : true;
    const hasData = hasExistingReading(turbine.id, hour);

    if (!cellIsEditable) {
      return "bg-gray-100 cursor-not-allowed border-gray-200";
    } else if (hasData) {
      return "border-green-300 bg-green-50 focus:border-green-500 focus:ring-green-200";
    } else {
      return "border-gray-300 focus:border-blue-500 focus:ring-blue-200";
    }
  };

  const onReviewSubmit = (data: FormData) => {
    const readingsArray = Object.values(data.readings);
    const readingsToUpdate = readingsArray
      .filter(
        (reading) =>
          reading.energy_generated > 0 ||
          hourlyReadings.some(
            (hr) =>
              hr.turbine_id === reading.turbine_id &&
              hr.hour === reading.hour &&
              hr.energy_generated > 0
          )
      )
      .map((reading) => ({
        turbine_id: Number(reading.turbine_id),
        hour: Number(reading.hour),
        energy_generated: Number(reading.energy_generated),
      }));

    if (readingsToUpdate.length === 0 && !currentReport) {
      toast.error("No readings to submit for a new report.");
      return;
    }
    if (readingsToUpdate.length === 0 && currentReport) {
      toast("No changes in readings to update.");
      return;
    }
    setDataToSubmit({ readings: readingsToUpdate });
    setShowConfirmationModal(true);
  };

  const handleConfirmSubmit = async () => {
    if (!dataToSubmit) return;
    try {
      let reportIdToUse = currentReport?.id;
      if (!reportIdToUse) {
        setIsCreatingReport(true);
        const initialReportData: InitialDailyReportCreate = {
          date: format(selectedDate, "yyyy-MM-dd"),
          power_plant_id: powerPlantId,
          gas_loss: 0,
          ncc_loss: 0,
          internal_loss: 0,
          gas_consumed: 0,
          declaration_total: 0,
          availability_capacity: 0,
          initial_turbine_stats: [],
        };
        await createDailyReport(initialReportData);
        const newReport = await fetchDailyReport(powerPlantId, selectedDate);
        if (!newReport?.id) {
          toast.error("Failed to create or retrieve daily report ID.");
          setIsCreatingReport(false);
          setShowConfirmationModal(false);
          return;
        }
        reportIdToUse = newReport.id;
        setIsCreatingReport(false);
      }
      console.log("Updating hourly readings with:", dataToSubmit);
      await updateHourlyReadings(reportIdToUse, dataToSubmit);
      toast.success("Hourly readings updated successfully");
      await fetchHourlyReadings(reportIdToUse);
    } catch (error: any) {
      // Extract proper error message
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        "An error occurred during submission";
      toast.error(errorMessage);
    } finally {
      setShowConfirmationModal(false);
      setDataToSubmit(null);
    }
  };

  const plantTurbinesForUI = allPlantTurbines[powerPlantId] || [];
  const isLoading = isReportLoading || isUpdatingHourly || isCreatingReport;
  const hasActiveReport = !!currentReport;
  const pastDeadline = isPastDeadline();
  const deadlineMessage = pastDeadline
    ? "Submission deadline has passed. Only editors can update."
    : currentReport?.submission_deadline
    ? `Deadline: ${new Date(
        currentReport.submission_deadline
      ).toLocaleString()}`
    : "";

  return (
    <>
      {isLoading && !showConfirmationModal ? (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <div className="mt-2 text-gray-600 font-medium">
              {isCreatingReport
                ? "Creating daily report..."
                : "Loading data..."}
            </div>
            <div className="text-sm text-gray-500">
              Please wait while we process your request
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onReviewSubmit)} className="space-y-6">
          {/* Date Selection using FormSection */}
          <FormSection
            title="Reading Date"
            icon={Calendar}
            description="Select the date for hourly generation readings"
          >
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

                {!hasActiveReport && !isCreatingReport && (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      No daily report for this date. One will be created if you
                      save readings.
                    </span>
                  </div>
                )}

                {isCreatingReport && (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                    <Settings className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium">
                      Creating initial daily report...
                    </span>
                  </div>
                )}
              </div>

              {hasActiveReport && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Editing Existing Report
                  </span>
                </div>
              )}
            </div>
          </FormSection>

          {/* Hourly Generation using TurbineHourlyTable */}
          <TurbineHourlyTable
            title="Energy Generation by Hour"
            turbines={plantTurbinesForUI}
            control={control}
            disabled={isLoading}
            fieldNamePattern={(turbineIndex, hourIndex) => {
              const turbine = plantTurbinesForUI[turbineIndex];
              const hour = hourIndex + 1;
              return `readings.${turbine.id}-${hour}.energy_generated`;
            }}
            onFieldChange={handleFieldChange}
            calculateTurbineTotal={calculateTurbineTotal}
            calculateGrandTotal={calculateGrandTotal}
            placeholder="0"
            unit="MWh"
            description="Enter actual energy generation for each turbine by hour"
            cellClassName={getCellClassName}
          />

          {/* Hidden fields for turbine_id and hour */}
          {plantTurbinesForUI.map((turbine) =>
            Array.from({ length: 24 }, (_, hourIndex) => {
              const hour = hourIndex + 1;
              const key = `${turbine.id}-${hour}`;
              return (
                <div key={key}>
                  <Controller
                    name={`readings.${key}.turbine_id`}
                    control={control}
                    defaultValue={turbine.id}
                    render={({ field }) => <input type="hidden" {...field} />}
                  />
                  <Controller
                    name={`readings.${key}.hour`}
                    control={control}
                    defaultValue={hour}
                    render={({ field }) => <input type="hidden" {...field} />}
                  />
                </div>
              );
            })
          )}

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

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total Generation</div>
                  <div className="text-lg font-bold text-gray-900">
                    {calculateGrandTotal().toFixed(2)} MWh
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={
                    isLoading ||
                    isCreatingReport ||
                    (!isEditor && pastDeadline && hasActiveReport)
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
                      Review & Save Readings
                    </>
                  )}
                </Button>
              </div>
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
              <span>Confirm Hourly Generation Submission</span>
            </DialogTitle>
            <DialogDescription>
              Review your hourly generation data before submitting.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-sm text-gray-500">Date</div>
                      <div className="font-semibold text-gray-900">
                        {format(selectedDate, "MMMM d, yyyy")}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="text-sm text-gray-500">
                        Total Generation
                      </div>
                      <div className="font-semibold text-gray-900">
                        {calculateGrandTotal().toFixed(2)} MWh
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="text-sm text-gray-500">
                        Readings Count
                      </div>
                      <div className="font-semibold text-gray-900">
                        {dataToSubmit?.readings.length || 0}
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
                      <div className="text-sm text-gray-500">Action</div>
                      <div className="font-semibold text-gray-900">
                        {currentReport ? "Update" : "Create & Save"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Turbine Generation Summary */}
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-purple-600" />
                  <span>Turbine Generation Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Summary totals */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">
                        Total Turbines
                      </div>
                      <div className="text-lg font-semibold text-blue-700">
                        {plantTurbinesForUI.length}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">
                        Active Turbines
                      </div>
                      <div className="text-lg font-semibold text-green-700">
                        {
                          plantTurbinesForUI.filter(
                            (turbine) =>
                              calculateTurbineTotalById(turbine.id) > 0
                          ).length
                        }
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">
                        Total Generated
                      </div>
                      <div className="text-lg font-semibold text-purple-700">
                        {calculateGrandTotal().toFixed(2)} MWh
                      </div>
                    </div>
                  </div>

                  {/* Individual turbine details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plantTurbinesForUI.map((turbine) => {
                      const total = calculateTurbineTotalById(turbine.id);
                      const hourlyData = getTurbineHourlyData(turbine.id);
                      const hasData = total > 0;

                      return (
                        <Card
                          key={turbine.id}
                          className={`border ${
                            hasData
                              ? "border-blue-200 bg-blue-50"
                              : "border-gray-200"
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    hasData ? "bg-blue-500" : "bg-gray-300"
                                  }`}
                                ></div>
                                <span className="font-medium text-gray-900">
                                  {turbine.name}
                                </span>
                              </div>
                              <span className="font-semibold text-blue-700">
                                {total.toFixed(2)} MWh
                              </span>
                            </div>

                            {hasData && (
                              <div className="space-y-2">
                                <div className="text-xs text-gray-600 font-medium">
                                  Hourly Breakdown:
                                </div>
                                <div className="grid grid-cols-6 gap-1 text-xs">
                                  {hourlyData.map((data, hourIndex) => (
                                    <div
                                      key={hourIndex}
                                      className={`text-center p-1 rounded ${
                                        data.energy_generated > 0
                                          ? "bg-blue-100 text-blue-800 font-medium"
                                          : "bg-gray-100 text-gray-500"
                                      }`}
                                    >
                                      <div className="text-xs">
                                        {String(data.hour).padStart(2, "0")}h
                                      </div>
                                      <div className="font-mono">
                                        {data.energy_generated || 0}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {!hasData && (
                              <div className="text-center py-2 text-gray-500 text-sm">
                                No generation data entered
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {calculateGrandTotal() === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      <span>No generation data entered</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

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
              onClick={handleConfirmSubmit}
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
                  Confirm & Submit
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
