'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../library/components/atoms/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import { toast } from 'react-hot-toast'

import { ExportDateRangeSelector } from '@/library/components/molecules/export-data-date-range-selector'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/library/components/atoms/select'
import { Button } from '@/library/components/atoms/button'
import {
  Users,
  Building2,
  Settings,
  BarChart3,
  AlertCircle,
  Download,
  TrendingUp,
  Activity,
  Database
} from 'lucide-react'
import { useAdminDashboardStore } from '@/library/store/admin-store'
import { downloadBlob, getErrorMessage } from '@/library/utils/error-utils'

const ROLE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AdminDashboard() {
  const {
    stats,
    powerPlants,
    isLoading,
    error,
    fetchDashboardStats,
    exportData,
    fetchPowerPlantsForExport
  } = useAdminDashboardStore()

  const [selectedPlantId, setSelectedPlantId] = useState<string>('all')
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          fetchDashboardStats(),
          fetchPowerPlantsForExport()
        ])
      } catch (error: unknown) {
        toast.error(getErrorMessage(error))
      }
    }

    initializeData()
  }, [fetchDashboardStats, fetchPowerPlantsForExport])



  const handleExport = async () => {
    try {
      setIsExporting(true)

      const params: Record<string, string> = {}
      if (selectedPlantId && selectedPlantId !== 'all') {
        params.power_plant_id = selectedPlantId
      }
      if (dateRange && dateRange.from.getTime() !== new Date(0).getTime()) {
        params.start_date = dateRange.from.toISOString().split('T')[0]
        params.end_date = dateRange.to.toISOString().split('T')[0]
      }

      const blob = await exportData(params)
      const filename = `plant_data_${new Date().toISOString().split('T')[0]}.xlsx`
      downloadBlob(blob, filename)

      toast.success('Data exported successfully')
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <div className="mt-2 text-gray-600 font-medium">Loading dashboard...</div>
          <div className="text-sm text-gray-500">Please wait while we fetch the statistics</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg border-2 border-dashed border-red-200">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-2" />
          <div className="text-red-800 font-medium">Error Loading Dashboard</div>
          <div className="text-sm text-red-600 mt-1">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <BarChart3 className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">System overview and management statistics</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Users</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Users</span>
              <span className="text-2xl font-bold text-blue-600">{stats?.users.total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Users</span>
              <span className="text-lg font-semibold text-green-600">{stats?.users.active || 0}</span>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                {stats?.users.active || 0} of {stats?.users.total || 0} users are active
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Building2 className="h-5 w-5 text-green-600" />
              <span>Power Plants</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Plants</span>
              <span className="text-2xl font-bold text-green-600">{stats?.powerPlants.total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Capacity</span>
              <span className="text-lg font-semibold text-blue-600">{stats?.powerPlants.totalCapacity || 0} MW</span>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Average: {stats?.powerPlants.total && stats.powerPlants.total > 0 ? (stats.powerPlants.totalCapacity / stats.powerPlants.total).toFixed(1) : 0} MW per plant
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Settings className="h-5 w-5 text-purple-600" />
              <span>Turbines</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Turbines</span>
              <span className="text-2xl font-bold text-purple-600">{stats?.turbines.total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg per Plant</span>
              <span className="text-lg font-semibold text-orange-600">
                {stats?.powerPlants.total && stats.powerPlants.total > 0
                  ? (stats.turbines.total / stats.powerPlants.total).toFixed(1)
                  : 'N/A'}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Distributed across {stats?.powerPlants.total || 0} plant{stats?.powerPlants.total !== 1 ? 's' : ''}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Roles Chart & Export Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Roles Chart */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>User Roles Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.users.byRole && stats.users.byRole.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.users.byRole}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.users.byRole.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={ROLE_COLORS[index % ROLE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No user role data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Export Section */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Database className="h-5 w-5 text-green-600" />
              <span>Export Plant Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Power Plant</label>
                <Select value={selectedPlantId} onValueChange={setSelectedPlantId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select power plant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plants</SelectItem>
                    {powerPlants.map((plant) => (
                      <SelectItem key={plant.id} value={plant.id.toString()}>
                        {plant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Date Range</label>
                <ExportDateRangeSelector onRangeChange={setDateRange} />
              </div>

              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full"
              >
                {isExporting ? (
                  <>
                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </>
                )}
              </Button>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <Activity className="w-4 h-4 inline mr-1" />
                Export includes daily reports, turbine statistics, and hourly generation data.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}