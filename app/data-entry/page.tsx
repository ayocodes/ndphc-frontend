// src/app/data-entry/page.tsx
"use client";

import {
  Card,
  CardContent
} from "@/library/components/atoms/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/library/components/atoms/tabs";
import { DailyReportForm } from "@/library/components/organisms/daily-report-form";
import { HourlyReadingForm } from "@/library/components/organisms/hourly-reading-form";
import { MorningReadingForm } from "@/library/components/organisms/morning-reading-form";
import { useAuthStore } from "@/library/store/auth-store";
import { usePowerPlantStore } from "@/library/store/power-plant-store";
import {
  BarChart3,
  Building2,
  ChevronRight,
  Clock,
  FileText,
  User
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DataEntryPage() {
  const { user } = useAuthStore();
  const { powerPlants, fetchPowerPlants, selectedPlantId, selectPowerPlant } =
    usePowerPlantStore();
  const [activePlant, setActivePlant] = useState<number | null>(null);
  const [formType, setFormType] = useState<string>("morning");
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Check if user has permission to access data entry
    const hasPermission =
      user.permissions.includes("submit_readings") ||
      user.permissions.includes("submit_reports");

    if (!hasPermission) {
      router.push("/dashboard");
    }

    fetchPowerPlants();
  }, [user, router, fetchPowerPlants]);

  useEffect(() => {
    // Set the active plant to the user's assigned plant or the selected plant
    if (user?.power_plant_id) {
      setActivePlant(user.power_plant_id);
      selectPowerPlant(user.power_plant_id);
    } else if (selectedPlantId) {
      setActivePlant(selectedPlantId);
    } else if (powerPlants.length > 0) {
      setActivePlant(powerPlants[0].id);
      selectPowerPlant(powerPlants[0].id);
    }
  }, [user, powerPlants, selectedPlantId, selectPowerPlant]);

  // Get the current plant name
  const currentPlantName =
    powerPlants.find((p) => p.id === activePlant)?.name || "";

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  const tabConfig = [
    {
      value: "morning",
      label: "11 o'clock Reading",
      icon: Clock,
      description: "Morning energy declarations",
    },
    {
      value: "hourly",
      label: "Hourly Readings",
      icon: BarChart3,
      description: "Hourly generation data",
    },
    {
      value: "daily",
      label: "Daily Report",
      icon: FileText,
      description: "Daily operational report",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <span>Home</span>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span>Data Entry</span>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-gray-900 font-medium">
              {currentPlantName}
            </span>
          </div>

          {/* Page Title & Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Data Entry</h1>
                <p className="text-gray-600">
                  Submit operational readings and reports
                </p>
              </div>
            </div>

            {/* Plant Info Card */}
            <Card className="w-72 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Building2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">Current Plant</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {currentPlantName}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-500">Online</span>
                  </div>
                </div>

                {/* User Info */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span>Operator: {user?.full_name || user?.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 ">
        <div className=" rounded-xl shadow-sm border border-gray-200 ">
          <Tabs
            value={formType}
            onValueChange={setFormType}
            className="w-full "
          >
            {/* Enhanced Tab Navigation */}
            <TabsList className="grid w-full grid-cols-3 bg-transparent p-1 border-none">
              {tabConfig.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="relative flex flex-col border-none items-center space-y-2 py-4 px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <IconComponent
                        className={`h-5 w-5 ${
                          formType === tab.value
                            ? "text-blue-600"
                            : "text-gray-500"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          formType === tab.value
                            ? "text-gray-900"
                            : "text-gray-600"
                        }`}
                      >
                        {tab.label}
                      </span>
                    </div>
                    <span
                      className={`text-xs ${
                        formType === tab.value
                          ? "text-gray-600"
                          : "text-gray-400"
                      }`}
                    >
                      {tab.description}
                    </span>
                    {formType === tab.value && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-t-full"></div>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Tab Content */}
            <div className="p-6 mt-10">
              <TabsContent value="morning" className="mt-0">
                {activePlant && (
                  <MorningReadingForm powerPlantId={activePlant} />
                )}
              </TabsContent>

              <TabsContent value="hourly" className="mt-0">
                {activePlant && (
                  <HourlyReadingForm powerPlantId={activePlant} />
                )}
              </TabsContent>

              <TabsContent value="daily" className="mt-0">
                {activePlant && <DailyReportForm powerPlantId={activePlant} />}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
