// src/app/dashboard/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/library/components/atoms/card";
import { MetricCard } from "@/library/components/molecules/metric-card";
import { useDashboardStore } from "@/library/store/dashboard-store";
import { format } from "date-fns";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  BatteryCharging,
  Clock,
  Droplet,
  Flame,
  Gauge,
  Lightbulb,
  TrendingUp
} from "lucide-react";
import { useEffect } from "react";

export default function DashboardPage() {
  const { summary, fetchSummary, isLoading, error } = useDashboardStore();

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <div className="mt-2 text-gray-600 font-medium">Loading dashboard data...</div>
          <div className="text-sm text-gray-500">Please wait while we fetch the latest metrics</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 m-8">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <div className="font-medium text-red-800">Error Loading Dashboard</div>
              <div className="text-sm text-red-600 mt-1">{error}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card className="shadow-sm border-gray-200 m-8">
        <CardContent className="p-12">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Dashboard Data Available</h3>
            <p className="text-sm text-gray-500">Unable to load dashboard metrics at this time.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format the current date
  const currentDate = new Date(summary.current_day.date);
  const day = currentDate.getDate();
  const dayOfWeek = format(currentDate, "EEE").toLowerCase();
  const month = format(currentDate, "MMMM");

  return (
    <div className="min-h-screen relative">
      {/* Background Image - Faded B&W */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-[0.15] pointer-events-none z-0"
        style={{
          backgroundImage: `url('/powerplant.jpg')`,
          filter: 'grayscale(100%) contrast(0.8) brightness(0.9)',
        }}
      />
      
      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Operations Dashboard</h1>
            <p className="text-gray-600">Real-time monitoring and performance metrics</p>
          </div>
        </div>

        {/* Current Day Metrics (Actually Yesterday's Complete Data) */}
        <Card className="shadow-sm border-gray-200 mb-8 bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div>
                    <CardTitle className="text-lg mb-0">Today&apos;s Performance</CardTitle>
                    <p className="text-sm text-gray-600">Latest operational data</p>
                  </div>
                </div>
                <div className="h-16 w-px bg-gray-300"></div>
                <div className="flex items-center space-x-3">
                  <div>
                    <div className="text-4xl font-bold text-gray-900">{day}</div>
                    <div className="text-lg text-gray-600 capitalize">{dayOfWeek}</div>
                    <div className="text-2xl font-semibold text-gray-800">{month}</div>
                  </div>
                </div>
              </div>

            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <MetricCard
                title="Energy Generated"
                value={summary.current_day.energy_generated}
                unit="MWh"
                percentageChange={summary.percentage_change.energy_generated}
                icon={<BatteryCharging className="w-4 h-4" />}
                colorClass="text-green-500"
              />
              <MetricCard
                title="Energy Exported"
                value={summary.current_day.energy_exported}
                unit="MWh"
                percentageChange={summary.percentage_change.energy_exported}
                icon={<ArrowUpRight className="w-4 h-4" />}
                colorClass="text-blue-500"
              />
              <MetricCard
                title="Energy Consumed"
                value={summary.current_day.energy_consumed}
                unit="MWh"
                percentageChange={summary.percentage_change.energy_consumed}
                icon={<Lightbulb className="w-4 h-4" />}
                colorClass="text-yellow-500"
              />
              <MetricCard
                title="Gas Consumed"
                value={summary.current_day.gas_consumed}
                unit="MMSCF"
                percentageChange={summary.percentage_change.gas_consumed}
                icon={<Flame className="w-4 h-4" />}
                colorClass="text-orange-500"
              />
              <MetricCard
                title="Average Power Exported"
                value={summary.current_day.avg_power_exported}
                unit="MW"
                percentageChange={summary.percentage_change.avg_power_exported}
                icon={<Activity className="w-4 h-4" />}
                colorClass="text-purple-500"
              />
              <MetricCard
                title="Dependability Index"
                value={summary.current_day.avg_dependability_index}
                unit="%"
                percentageChange={summary.percentage_change.avg_dependability_index}
                icon={<Gauge className="w-4 h-4" />}
                colorClass="text-indigo-500"
              />
              <MetricCard
                title="Gas Utilization"
                value={summary.current_day.avg_gas_utilization}
                unit="%"
                percentageChange={summary.percentage_change.avg_gas_utilization}
                icon={<Droplet className="w-4 h-4" />}
                colorClass="text-red-500"
              />
              <MetricCard
                title="Availability Factor"
                value={summary.current_day.avg_availability_factor}
                unit="%"
                percentageChange={summary.percentage_change.avg_availability_factor}
                icon={<Clock className="w-4 h-4" />}
                colorClass="text-teal-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Previous Day Metrics */}
        <Card className="shadow-sm border-gray-200 bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Clock className="h-5 w-5 text-gray-600" />
              <span>Yesterday&apos;s Performance</span>
              <span className="text-sm font-normal text-gray-500">
                - {format(new Date(summary.previous_day.date), "d, EEE MMMM")}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <MetricCard
                title="Energy Generated"
                value={summary.previous_day.energy_generated}
                unit="MWh"
                icon={<BatteryCharging className="w-4 h-4" />}
                colorClass="text-green-500"
              />
              <MetricCard
                title="Energy Exported"
                value={summary.previous_day.energy_exported}
                unit="MWh"
                icon={<ArrowUpRight className="w-4 h-4" />}
                colorClass="text-blue-500"
              />
              <MetricCard
                title="Energy Consumed"
                value={summary.previous_day.energy_consumed}
                unit="MWh"
                icon={<Lightbulb className="w-4 h-4" />}
                colorClass="text-yellow-500"
              />
              <MetricCard
                title="Gas Consumed"
                value={summary.previous_day.gas_consumed}
                unit="MMSCF"
                icon={<Flame className="w-4 h-4" />}
                colorClass="text-orange-500"
              />
              <MetricCard
                title="Average Power Exported"
                value={summary.previous_day.avg_power_exported}
                unit="MW"
                icon={<Activity className="w-4 h-4" />}
                colorClass="text-purple-500"
              />
              <MetricCard
                title="Dependability Index"
                value={summary.previous_day.avg_dependability_index}
                unit="%"
                icon={<Gauge className="w-4 h-4" />}
                colorClass="text-indigo-500"
              />
              <MetricCard
                title="Gas Utilization"
                value={summary.previous_day.avg_gas_utilization}
                unit="%"
                icon={<Droplet className="w-4 h-4" />}
                colorClass="text-red-500"
              />
              <MetricCard
                title="Availability Factor"
                value={summary.previous_day.avg_availability_factor}
                unit="%"
                icon={<Clock className="w-4 h-4" />}
                colorClass="text-teal-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}