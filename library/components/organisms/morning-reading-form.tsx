// src/components/organisms/morning-reading-form.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { DatePicker } from "@/library/components/molecules/date-picker";
import { Button } from "@/library/components/atoms/button";
import { usePowerPlantStore } from "@/library/store/power-plant-store";
import { useMorningReadingStore } from "@/library/store/morning-reading-store";
import { useAuthStore } from "@/library/store/auth-store";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import {
  MorningReadingCreate,
  MorningReadingUpdate,
  MorningReadingWithDeclarations,
  TurbineDeclarationCreate
} from "@/library/types/morning-reading";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/library/components/atoms/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/library/components/atoms/card";

// Import reusable components
import { FormSection } from "@/library/components/molecules/form-section";
import { FormField } from "@/library/components/molecules/form-field";
import { TurbineHourlyTable } from "@/library/components/molecules/turbine-hourly-table";

import { 
  Calendar,
  Zap,
  BarChart3,
  Clock,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Activity,
  Settings
} from "lucide-react";

interface MorningReadingFormProps {
  powerPlantId: number;
  readingId?: string;
}

export function MorningReadingForm({ powerPlantId, readingId }: MorningReadingFormProps) {
  const { user } = useAuthStore();
  const { fetchTurbinesForPlant, turbines } = usePowerPlantStore();
  const {
    isLoading, error, currentReading,
    createMorningReading, updateMorningReading, fetchMorningReading, resetState
  } = useMorningReadingStore();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState<MorningReadingCreate | null>(null);
  const [isFetchingData, setIsFetchingData] = useState(false);

  const isEditor = user?.role === "editor";

  const { control, handleSubmit, setValue, reset, watch } = useForm<MorningReadingCreate>({
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      power_plant_id: powerPlantId,
      declaration_total: 0,
      availability_capacity: 0,
      turbine_declarations: []
    }
  });

  // Watch turbine declarations to calculate totals
  const turbineDeclarations = watch('turbine_declarations');

  // Deadline logic functions
  const isPastDeadline = () => {
    if (!currentReading?.submission_deadline) return false;
    const deadline = new Date(currentReading.submission_deadline);
    return new Date() > deadline;
  };

  const isFormEditable = () => {
    if (!currentReading) return true; // New reading is always editable
    if (isEditor) return true; // Editors can always edit
    if (isPastDeadline()) return false; // Past deadline = not editable for non-editors
    return true; // Within deadline = editable
  };

  // Load turbines for the selected power plant
  useEffect(() => {
    fetchTurbinesForPlant(powerPlantId);
  }, [powerPlantId, fetchTurbinesForPlant]);

  // Initialize form with turbines when they're loaded
  useEffect(() => {
    if (turbines[powerPlantId]?.length && !currentReading) {
      const initialDeclarations: TurbineDeclarationCreate[] = turbines[powerPlantId].map(turbine => ({
        turbine_id: turbine.id,
        hourly_declarations: Array.from({ length: 24 }, (_, i) => ({
          hour: i + 1,
          declared_output: 0
        }))
      }));

      setValue('turbine_declarations', initialDeclarations);
    }
  }, [turbines, powerPlantId, setValue, currentReading]);

  // Fetch or initialize reading when date changes
  useEffect(() => {
    const setupForm = async () => {
      if (selectedDate) {
        setIsFetchingData(true);
        try {
          resetState();
          await fetchMorningReading(powerPlantId, selectedDate);
        } catch (error: any) {
          if (error.response?.status === 404 && !readingId) {
            resetState();
            
            if (turbines[powerPlantId]?.length) {
              const emptyDeclarations: TurbineDeclarationCreate[] = turbines[powerPlantId].map(turbine => ({
                turbine_id: turbine.id,
                hourly_declarations: Array.from({ length: 24 }, (_, i) => ({
                  hour: i + 1,
                  declared_output: 0
                }))
              }));
              
              reset({
                date: format(selectedDate, "yyyy-MM-dd"),
                power_plant_id: powerPlantId,
                declaration_total: 0,
                availability_capacity: 0,
                turbine_declarations: emptyDeclarations
              });
            }
          } else {
            toast.error("Error loading reading data");
          }
        } finally {
          setIsFetchingData(false);
        }
      }
    };

    setupForm();
  }, [powerPlantId, selectedDate, readingId, fetchMorningReading, resetState, turbines, reset]);

  // Update form with current reading data
  useEffect(() => {
    if (currentReading && turbines[powerPlantId]?.length) {
      const reading = currentReading as MorningReadingWithDeclarations;
      
      const declarationsByTurbine = (reading.hourly_declarations || []).reduce((acc, decl) => {
        if (!acc[decl.turbine_id]) {
          acc[decl.turbine_id] = Array(24).fill(null);
        }
        acc[decl.turbine_id][decl.hour - 1] = decl;
        return acc;
      }, {} as Record<number, (any | null)[]>);

      const allTurbineDeclarations: TurbineDeclarationCreate[] = turbines[powerPlantId].map(turbine => ({
        turbine_id: turbine.id,
        hourly_declarations: Array.from({ length: 24 }, (_, index) => {
          const hour = index + 1;
          const existingDecl = declarationsByTurbine[turbine.id]?.[index];
          
          return {
            hour,
            declared_output: existingDecl ? existingDecl.declared_output : 0
          };
        })
      }));

      reset({
        date: reading.date,
        power_plant_id: reading.power_plant_id,
        declaration_total: reading.declaration_total || 0,
        availability_capacity: reading.availability_capacity || 0,
        turbine_declarations: allTurbineDeclarations
      });
    }
  }, [currentReading, reset, turbines, powerPlantId]);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setValue('date', format(date, "yyyy-MM-dd"));
    }
  };

  // Calculate total declared output for a turbine
  const calculateTurbineTotal = (turbineIndex: number) => {
    if (!turbineDeclarations?.[turbineIndex]?.hourly_declarations) return 0;
    return turbineDeclarations[turbineIndex].hourly_declarations.reduce(
      (sum, decl) => sum + (decl.declared_output || 0),
      0
    );
  };

  // Calculate grand total of all turbines
  const calculateGrandTotal = () => {
    if (!turbineDeclarations) return 0;
    return turbineDeclarations.reduce((sum, turbine, index) => sum + calculateTurbineTotal(index), 0);
  };

  const handleFormSubmit = async (data: MorningReadingCreate) => {
    const formattedData: MorningReadingCreate = {
      ...data,
      date: format(selectedDate, "yyyy-MM-dd"),
      power_plant_id: powerPlantId,
      turbine_declarations: data.turbine_declarations.map(turbine => ({
        turbine_id: turbine.turbine_id,
        hourly_declarations: turbine.hourly_declarations.map(decl => ({
          hour: decl.hour,
          declared_output: decl.declared_output || 0
        }))
      }))
    };
    
    setFormData(formattedData);
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    if (!formData) return;

    try {
      setIsSubmitting(true);

      if (currentReading?.id) {
        const updateData: MorningReadingUpdate = {
          power_plant_id: formData.power_plant_id,
          declaration_total: formData.declaration_total,
          availability_capacity: formData.availability_capacity,
          turbine_declarations: formData.turbine_declarations.map(turbine => ({
            turbine_id: turbine.turbine_id,
            hourly_declarations: turbine.hourly_declarations.map(decl => ({
              hour: decl.hour,
              declared_output: decl.declared_output
            }))
          }))
        };

        try {
          await updateMorningReading(currentReading.id.toString(), updateData);
          await fetchMorningReading(powerPlantId, selectedDate);
          toast.success("Morning reading updated successfully");
        } catch (updateError: any) {
          console.error('Error during update:', updateError);
          const errorMessage = updateError.response?.data?.detail || updateError.message || "Failed to update reading. Please try again.";
          toast.error(errorMessage);
        }
      } else {
        const createData = { ...formData };
        
        try {
          await createMorningReading(createData);
          await fetchMorningReading(powerPlantId, selectedDate);
          toast.success("Morning reading submitted successfully");
        } catch (createError: any) {
          console.error('Error during create:', createError);
          const errorMessage = createError.response?.data?.detail || createError.message || "Failed to create reading. Please try again.";
          toast.error(errorMessage);
        }
      }

      setShowConfirmation(false);
      setIsSubmitting(false);
    } catch (error: any) {
      console.error('Submission error:', error);
      const errorMessage = error.response?.data?.detail || error.message || "An unexpected error occurred";
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  // Handle field changes in the hourly table
  const handleFieldChange = (turbineIndex: number, hourIndex: number, value: number, turbineId: number, hour: number) => {
    setValue(`turbine_declarations.${turbineIndex}.turbine_id`, turbineId);
    setValue(`turbine_declarations.${turbineIndex}.hourly_declarations.${hourIndex}.hour`, hour);
  };

  const plantTurbines = turbines[powerPlantId] || [];
  const hasActiveReport = !!currentReading;
  const pastDeadline = isPastDeadline();
  const formEditable = isFormEditable();
  const deadlineMessage = pastDeadline
    ? "Submission deadline has passed. Only editors can update."
    : currentReading?.submission_deadline
    ? `Deadline: ${new Date(currentReading.submission_deadline).toLocaleString()}`
    : "";

  return (
    <>
      {isFetchingData ? (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <div className="mt-2 text-gray-600 font-medium">Loading data...</div>
            <div className="text-sm text-gray-500">Please wait while we fetch the reading data</div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Date Selection using FormSection */}
          <FormSection 
            title="Reading Date" 
            icon={Calendar}
            description="Select the date for this morning reading"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <DatePicker
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  disabled={isLoading || !!readingId || isSubmitting}
                />
                
                {hasActiveReport && (
                  <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                    pastDeadline
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}>
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
                      No morning reading for this date. One will be created if you save.
                    </span>
                  </div>
                )}
              </div>
              
              {hasActiveReport && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Editing Existing Reading</span>
                </div>
              )}
            </div>
          </FormSection>

          {/* Plant Capacity Settings using FormSection */}
          <FormSection 
            title="Plant Capacity Settings" 
            icon={BarChart3}
            description="Set the plant's capacity declarations for the day"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Declaration Total"
                name="declaration_total"
                control={control}
                unit="MW"
                required
                disabled={isLoading || isSubmitting || !formEditable}
                rules={{ required: "Declaration total is required" }}
              />
              <FormField
                label="Availability Capacity"
                name="availability_capacity"
                control={control}
                unit="MW"
                required
                disabled={isLoading || isSubmitting || !formEditable}
                rules={{ required: "Availability capacity is required" }}
              />
            </div>
          </FormSection>

          {/* Hourly Declarations using TurbineHourlyTable */}
          <TurbineHourlyTable
            title="GT Energy Declared by Hour"
            turbines={plantTurbines}
            control={control}
            disabled={isLoading || isSubmitting || !formEditable}
            fieldNamePattern={(turbineIndex, hourIndex) => 
              `turbine_declarations.${turbineIndex}.hourly_declarations.${hourIndex}.declared_output`
            }
            onFieldChange={handleFieldChange}
            calculateTurbineTotal={calculateTurbineTotal}
            calculateGrandTotal={calculateGrandTotal}
            placeholder="0"
            unit="MWh"
            description="Enter energy declarations for each turbine by hour"
          />

          {/* Action Bar */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Status:</span>{" "}
                  {!hasActiveReport
                    ? "New reading will be created"
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
                  <div className="text-sm text-gray-500">Total Declared</div>
                  <div className="text-lg font-bold text-gray-900">{calculateGrandTotal().toFixed(2)} MWh</div>
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading || isSubmitting || (!isEditor && pastDeadline && hasActiveReport)}
                  className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
                >
                  {isSubmitting ? (
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
          </div>
        </form>
      )}

      {/* Enhanced Confirmation Modal */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-xl">
              <CheckCircle2 className="h-6 w-6 text-blue-600" />
              <span>Confirm Morning Reading Submission</span>
            </DialogTitle>
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
                      <div className="font-semibold text-gray-900">{format(selectedDate, "MMMM d, yyyy")}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    <div>
                      <div className="text-sm text-gray-500">Total Declaration</div>
                      <div className="font-semibold text-gray-900">{formData?.declaration_total} MW</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-sm text-gray-500">Availability Capacity</div>
                      <div className="font-semibold text-gray-900">{formData?.availability_capacity} MW</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="text-sm text-gray-500">Total Declared Output</div>
                      <div className="font-semibold text-gray-900">{calculateGrandTotal().toFixed(2)} MWh</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Turbine Declarations Summary */}
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-purple-600" />
                  <span>Turbine Declarations Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Summary totals */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Total Turbines</div>
                      <div className="text-lg font-semibold text-blue-700">{plantTurbines.length}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Active Turbines</div>
                      <div className="text-lg font-semibold text-green-700">
                        {plantTurbines.filter((_, index) => calculateTurbineTotal(index) > 0).length}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Total Declared</div>
                      <div className="text-lg font-semibold text-purple-700">
                        {calculateGrandTotal().toFixed(2)} MWh
                      </div>
                    </div>
                  </div>
                  
                  {/* Individual turbine details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plantTurbines.map((turbine, index) => {
                      const total = calculateTurbineTotal(index);
                      const turbineDeclaration = turbineDeclarations?.[index];
                      const hasData = total > 0;
                      
                      return (
                        <Card key={turbine.id} className={`border ${hasData ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${hasData ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                <span className="font-medium text-gray-900">{turbine.name}</span>
                              </div>
                              <span className="font-semibold text-blue-700">{total.toFixed(2)} MWh</span>
                            </div>
                            
                            {hasData && turbineDeclaration?.hourly_declarations && (
                              <div className="space-y-2">
                                <div className="text-xs text-gray-600 font-medium">Hourly Breakdown:</div>
                                <div className="grid grid-cols-6 gap-1 text-xs">
                                  {turbineDeclaration.hourly_declarations.map((decl, hourIndex) => (
                                    <div 
                                      key={hourIndex} 
                                      className={`text-center p-1 rounded ${
                                        decl.declared_output > 0 
                                          ? 'bg-blue-100 text-blue-800 font-medium' 
                                          : 'bg-gray-100 text-gray-500'
                                      }`}
                                    >
                                      <div className="text-xs">{String(hourIndex + 1).padStart(2, '0')}h</div>
                                      <div className="font-mono">{decl.declared_output || 0}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {!hasData && (
                              <div className="text-center py-2 text-gray-500 text-sm">
                                No declarations entered
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
                      <span>No turbine declarations entered</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
              disabled={isSubmitting}
              className="px-6"
            >
              Back to Edit
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="px-6 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {currentReading?.id ? "Update Reading" : "Submit Reading"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}