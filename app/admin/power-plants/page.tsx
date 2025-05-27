'use client'

import { useState, useEffect } from 'react'
import { Button } from '../../../library/components/atoms/button'
import { Input } from '../../../library/components/atoms/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../library/components/atoms/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../library/components/atoms/table'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../library/components/atoms/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '../../../library/components/atoms/card'
import { DeleteConfirmationModal } from '../../../library/components/atoms/delete-confirmation-modal'
import { toast } from 'react-hot-toast'
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Settings,
  MapPin,
  Zap,
  AlertCircle,
  Factory
} from 'lucide-react'
import { usePowerPlantsStore } from '@/library/store/admin-store'
import { PowerPlant, Turbine } from '@/library/service/admin-service'
import { getErrorMessage, validatePowerPlantForm, validateTurbineForm } from '@/library/utils/error-utils'

// Define type for a delete operation to make the code cleaner
type DeleteOperation =
  | { type: 'plant'; item: PowerPlant }
  | { type: 'turbine'; item: Turbine; plantId: number };

export default function PowerPlantsPage() {
  const {
    powerPlants,
    expandedPlant,
    isLoading,
    error,
    fetchPowerPlants,
    fetchPlantDetails,
    createPowerPlant,
    updatePowerPlant,
    deletePowerPlant,
    createTurbine,
    updateTurbine,
    deleteTurbine
  } = usePowerPlantsStore()

  const [isAddPlantDialogOpen, setIsAddPlantDialogOpen] = useState(false)
  const [isEditPlantDialogOpen, setIsEditPlantDialogOpen] = useState(false)
  const [isAddTurbineDialogOpen, setIsAddTurbineDialogOpen] = useState(false)
  const [isEditTurbineDialogOpen, setIsEditTurbineDialogOpen] = useState(false)
  const [editingPlant, setEditingPlant] = useState<PowerPlant | null>(null)
  const [editingTurbine, setEditingTurbine] = useState<Turbine | null>(null)
  const [currentPlantId, setCurrentPlantId] = useState<number | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteOperation, setDeleteOperation] = useState<DeleteOperation | null>(null)

  const [newPlant, setNewPlant] = useState<Omit<PowerPlant, 'id' | 'turbine_count'>>({
    name: '',
    location: '',
    total_capacity: 0
  })

  const [newTurbine, setNewTurbine] = useState<Omit<Turbine, 'id' | 'power_plant_id'>>({
    name: '',
    capacity: 0
  })

  // Fetch power plants
  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetchPowerPlants()
      } catch (error: unknown) {
        toast.error(getErrorMessage(error))
      }
    }

    initializeData()
  }, [fetchPowerPlants])

  // Fetch plant details when expanded
  const handlePlantExpand = async (plantId: number) => {
    try {
      if (expandedPlant !== plantId) {
        await fetchPlantDetails(plantId)
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleAddPlant = async () => {
    const validationError = validatePowerPlantForm(newPlant);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      await createPowerPlant(newPlant)
      setNewPlant({
        name: '',
        location: '',
        total_capacity: 0
      })
      setIsAddPlantDialogOpen(false)
      toast.success('Power plant added successfully')
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleUpdatePlant = async () => {
    if (!editingPlant) return

    const validationError = validatePowerPlantForm(editingPlant);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      await updatePowerPlant(editingPlant.id, editingPlant)
      setIsEditPlantDialogOpen(false)
      toast.success('Power plant updated successfully')
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    }
  }

  const openDeleteModal = (operation: DeleteOperation) => {
    setDeleteOperation(operation)
    setDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteOperation) return

    try {
      if (deleteOperation.type === 'plant') {
        await deletePowerPlant(deleteOperation.item.id)
        toast.success('Power plant deleted successfully')
      } else {
        await deleteTurbine(deleteOperation.item.id, deleteOperation.plantId)
        toast.success('Turbine deleted successfully')
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    } finally {
      setDeleteOperation(null)
      setDeleteModalOpen(false)
    }
  }

  const handleAddTurbine = async () => {
    if (!currentPlantId) return

    const validationError = validateTurbineForm(newTurbine);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      await createTurbine(currentPlantId, newTurbine)
      setNewTurbine({
        name: '',
        capacity: 0
      })
      setIsAddTurbineDialogOpen(false)
      toast.success('Turbine added successfully')
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleUpdateTurbine = async () => {
    if (!editingTurbine || !currentPlantId) return

    const validationError = validateTurbineForm(editingTurbine);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      await updateTurbine(editingTurbine.id, editingTurbine)
      setIsEditTurbineDialogOpen(false)
      toast.success('Turbine updated successfully')
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <div className="mt-2 text-gray-600 font-medium">Loading power plants...</div>
          <div className="text-sm text-gray-500">Please wait while we fetch the data</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg border-2 border-dashed border-red-200">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-2" />
          <div className="text-red-800 font-medium">Error Loading Power Plants</div>
          <div className="text-sm text-red-600 mt-1">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Power Plant Management</h1>
            <p className="text-gray-600">Manage power plants and their turbines</p>
          </div>
        </div>

        <Dialog open={isAddPlantDialogOpen} onOpenChange={setIsAddPlantDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Power Plant</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>Add New Power Plant</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">Plant Name *</label>
                <Input
                  id="name"
                  value={newPlant.name}
                  onChange={(e) => setNewPlant({ ...newPlant, name: e.target.value })}
                  placeholder="Enter plant name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium text-gray-700">Location *</label>
                <Input
                  id="location"
                  value={newPlant.location}
                  onChange={(e) => setNewPlant({ ...newPlant, location: e.target.value })}
                  placeholder="Enter location"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="capacity" className="text-sm font-medium text-gray-700">Total Capacity (MW) *</label>
                <Input
                  id="capacity"
                  type="number"
                  min="0"
                  step="0.1"
                  value={newPlant.total_capacity}
                  onChange={(e) => setNewPlant({ ...newPlant, total_capacity: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter capacity in MW"
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleAddPlant}>
                  <Plus className="w-4 h-4 mr-2" />
                  Save Power Plant
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Power Plants List */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <span>All Power Plants ({powerPlants.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {powerPlants.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {powerPlants.map((plant) => (
                <AccordionItem key={plant.id} value={plant.id.toString()} className="border-b last:border-b-0">
                  <AccordionTrigger
                    onClick={() => handlePlantExpand(plant.id)}
                    className="px-6 py-4 hover:bg-gray-50 [&[data-state=open]>div]:bg-blue-50"
                  >
                    <div className="flex justify-between items-center w-full pr-4">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Factory className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-gray-900">{plant.name}</div>
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span>{plant.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">{plant.total_capacity} MW</div>
                          <div className="text-xs text-gray-500">Capacity</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{plant.turbine_count || 0}</div>
                          <div className="text-xs text-gray-500">Turbines</div>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="px-6 pb-6">
                      <Card className="bg-gray-50 border-gray-200">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center space-x-2">
                              <Settings className="h-5 w-5 text-gray-600" />
                              <h3 className="text-lg font-semibold text-gray-900">Plant Management</h3>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingPlant(plant)
                                  setIsEditPlantDialogOpen(true)
                                }}
                                className="flex items-center space-x-1"
                              >
                                <Edit className="w-3 h-3" />
                                <span>Edit Plant</span>
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => openDeleteModal({ type: 'plant', item: plant })}
                                className="flex items-center space-x-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete Plant</span>
                              </Button>
                            </div>
                          </div>

                          {/* Turbines Section */}
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h4 className="text-md font-medium text-gray-900 flex items-center space-x-2">
                                <Zap className="h-4 w-4 text-yellow-600" />
                                <span>Turbines ({plant.turbines?.length || 0})</span>
                              </h4>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setCurrentPlantId(plant.id)
                                  setIsAddTurbineDialogOpen(true)
                                }}
                                className="flex items-center space-x-1"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add Turbine</span>
                              </Button>
                            </div>

                            {plant.turbines && plant.turbines.length > 0 ? (
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-white">
                                      <TableHead className="font-semibold text-gray-700">Turbine Name</TableHead>
                                      <TableHead className="font-semibold text-gray-700">Capacity (MW)</TableHead>
                                      <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {plant.turbines.map((turbine) => (
                                      <TableRow key={turbine.id} className="hover:bg-gray-50">
                                        <TableCell className="font-medium text-gray-900">{turbine.name}</TableCell>
                                        <TableCell className="text-gray-600">{turbine.capacity} MW</TableCell>
                                        <TableCell className="text-right">
                                          <div className="flex justify-end space-x-2">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => {
                                                setEditingTurbine(turbine)
                                                setCurrentPlantId(plant.id)
                                                setIsEditTurbineDialogOpen(true)
                                              }}
                                              className="flex items-center space-x-1"
                                            >
                                              <Edit className="w-3 h-3" />
                                              <span>Edit</span>
                                            </Button>
                                            <Button
                                              variant="destructive"
                                              size="sm"
                                              onClick={() => openDeleteModal({ type: 'turbine', item: turbine, plantId: plant.id })}
                                              className="flex items-center space-x-1"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                              <span>Delete</span>
                                            </Button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            ) : (
                              <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                                <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No turbines found</h3>
                                <p className="text-sm text-gray-500 mb-4">This power plant doesn&apos;t have any turbines yet.</p>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setCurrentPlantId(plant.id)
                                    setIsAddTurbineDialogOpen(true)
                                  }}
                                  className="flex items-center space-x-2"
                                >
                                  <Plus className="w-4 h-4" />
                                  <span>Add First Turbine</span>
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No power plants found</h3>
              <p className="text-sm text-gray-500">Get started by adding your first power plant.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Plant Dialog */}
      {editingPlant && (
        <Dialog open={isEditPlantDialogOpen} onOpenChange={setIsEditPlantDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Edit className="w-5 h-5 text-blue-600" />
                <span>Edit Power Plant</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-name" className="text-sm font-medium text-gray-700">Plant Name *</label>
                <Input
                  id="edit-name"
                  value={editingPlant.name}
                  onChange={(e) => setEditingPlant({ ...editingPlant, name: e.target.value })}
                  placeholder="Enter plant name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-location" className="text-sm font-medium text-gray-700">Location *</label>
                <Input
                  id="edit-location"
                  value={editingPlant.location}
                  onChange={(e) => setEditingPlant({ ...editingPlant, location: e.target.value })}
                  placeholder="Enter location"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-capacity" className="text-sm font-medium text-gray-700">Total Capacity (MW) *</label>
                <Input
                  id="edit-capacity"
                  type="number"
                  min="0"
                  step="0.1"
                  value={editingPlant.total_capacity}
                  onChange={(e) => setEditingPlant({ ...editingPlant, total_capacity: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter capacity in MW"
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleUpdatePlant}>
                  <Edit className="w-4 h-4 mr-2" />
                  Update Power Plant
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Turbine Dialog */}
      <Dialog open={isAddTurbineDialogOpen} onOpenChange={setIsAddTurbineDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <span>Add New Turbine</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="turbine-name" className="text-sm font-medium text-gray-700">Turbine Name *</label>
              <Input
                id="turbine-name"
                value={newTurbine.name}
                onChange={(e) => setNewTurbine({ ...newTurbine, name: e.target.value })}
                placeholder="Enter turbine name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="turbine-capacity" className="text-sm font-medium text-gray-700">Capacity (MW) *</label>
              <Input
                id="turbine-capacity"
                type="number"
                min="0"
                step="0.1"
                value={newTurbine.capacity}
                onChange={(e) => setNewTurbine({ ...newTurbine, capacity: parseFloat(e.target.value) || 0 })}
                placeholder="Enter capacity in MW"
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleAddTurbine}>
                <Plus className="w-4 h-4 mr-2" />
                Save Turbine
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Turbine Dialog */}
      {editingTurbine && (
        <Dialog open={isEditTurbineDialogOpen} onOpenChange={setIsEditTurbineDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Edit className="w-5 h-5 text-blue-600" />
                <span>Edit Turbine</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-turbine-name" className="text-sm font-medium text-gray-700">Turbine Name *</label>
                <Input
                  id="edit-turbine-name"
                  value={editingTurbine.name}
                  onChange={(e) => setEditingTurbine({ ...editingTurbine, name: e.target.value })}
                  placeholder="Enter turbine name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-turbine-capacity" className="text-sm font-medium text-gray-700">Capacity (MW) *</label>
                <Input
                  id="edit-turbine-capacity"
                  type="number"
                  min="0"
                  step="0.1"
                  value={editingTurbine.capacity}
                  onChange={(e) => setEditingTurbine({ ...editingTurbine, capacity: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter capacity in MW"
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleUpdateTurbine}>
                  <Edit className="w-4 h-4 mr-2" />
                  Update Turbine
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setDeleteOperation(null)
        }}
        onConfirm={handleDelete}
        title={deleteOperation?.type === 'plant' ? 'Delete Power Plant' : 'Delete Turbine'}
        description={
          deleteOperation?.type === 'plant'
            ? `Are you sure you want to delete "${deleteOperation.item.name}"? This will also delete all associated turbines. This action cannot be undone.`
            : `Are you sure you want to delete "${deleteOperation?.item.name}"? This action cannot be undone.`
        }
        itemName={deleteOperation?.item.name || ''}
      />
    </div>
  )
}