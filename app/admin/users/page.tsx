'use client'

import { useState, useEffect } from 'react'
import { Button } from '../../../library/components/atoms/button'
import { Input } from '../../../library/components/atoms/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../library/components/atoms/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../library/components/atoms/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../library/components/atoms/table'
import { Card, CardContent, CardHeader, CardTitle } from '../../../library/components/atoms/card'
import { DeleteConfirmationModal } from '../../../library/components/atoms/delete-confirmation-modal'
import { toast } from 'react-hot-toast'
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Building2,
  Shield
} from 'lucide-react'
import { useUsersStore } from '@/library/store/admin-store'
import { User, UserCreateData, UserUpdateData } from '@/library/service/admin-service'
import { getErrorMessage, validateUserForm } from '@/library/utils/error-utils'

const userRoles = [
  { value: 'viewer', label: 'Viewer', color: 'bg-gray-100 text-gray-800' },
  { value: 'operator', label: 'Operator', color: 'bg-blue-100 text-blue-800' },
  { value: 'editor', label: 'Editor', color: 'bg-green-100 text-green-800' },
  { value: 'admin', label: 'Admin', color: 'bg-red-100 text-red-800' }
]

export default function UsersPage() {
  const {
    users,
    powerPlants,
    isLoading,
    error,
    fetchUsers,
    fetchPowerPlants,
    createUser,
    updateUser,
    deleteUser
  } = useUsersStore()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const [newUser, setNewUser] = useState<User>({
    id: 0,
    email: '',
    full_name: '',
    password: '',
    role: 'viewer',
    power_plant_id: null,
    is_active: true
  })

  // Fetch users and power plants
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          fetchUsers(),
          fetchPowerPlants()
        ])
      } catch (error: unknown) {
        toast.error(getErrorMessage(error))
      }
    }

    initializeData()
  }, [fetchUsers, fetchPowerPlants])

  // Reset form when dialog is opened
  useEffect(() => {
    if (isAddDialogOpen) {
      setNewUser({
        id: 0,
        email: '',
        full_name: '',
        password: '',
        role: 'viewer',
        power_plant_id: null,
        is_active: true
      })
      setValidationError(null)
    }
  }, [isAddDialogOpen])

  const handleAddUser = async () => {
    // Validate form
    const error = validateUserForm(newUser);
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null);

    try {
      // Prepare user data for API submission - match exact format expected by backend
      const userData: UserCreateData = {
        email: newUser.email,
        full_name: newUser.full_name,
        password: newUser.password || '',
        role: newUser.role.toLowerCase(), // Ensure role is lowercase as API expects
        is_active: newUser.is_active,
        power_plant_id: newUser.power_plant_id
      }

      await createUser(userData)
      setNewUser({
        id: 0,
        email: '',
        full_name: '',
        password: '',
        role: 'viewer',
        power_plant_id: null,
        is_active: true
      })
      setIsAddDialogOpen(false)
      toast.success('User added successfully')
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error)
      setValidationError(errorMessage)
    }
  }

  // Update user role and handle power plant assignment logic
  const handleRoleChange = (role: string) => {
    setNewUser({
      ...newUser,
      role: role,
      // If changing to operator or editor and no power plant is selected, select the first one
      power_plant_id: (role === 'operator' || role === 'editor') && !newUser.power_plant_id && powerPlants.length > 0
        ? powerPlants[0].id
        : newUser.power_plant_id
    });
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return

    // Validate power plant assignment for operators and editors
    if ((editingUser.role === 'operator' || editingUser.role === 'editor') && !editingUser.power_plant_id) {
      setValidationError('Operators and Editors must be assigned to a power plant');
      return;
    }

    // Validate password if provided
    if (editingUser.password && editingUser.password.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return;
    }

    setValidationError(null);

    try {
      // Prepare user data for API submission
      const userData: UserUpdateData = {
        email: editingUser.email,
        full_name: editingUser.full_name,
        role: editingUser.role.toLowerCase(), // Ensure role is lowercase for API
        power_plant_id: editingUser.power_plant_id,
        is_active: editingUser.is_active
      };

      // Add password only if it's provided
      if (editingUser.password) {
        userData.password = editingUser.password;
      }

      await updateUser(editingUser.id, userData)
      setIsEditDialogOpen(false)
      setEditingUser(null)
      toast.success('User updated successfully')
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error)
      setValidationError(errorMessage)
    }
  }

  // Update role in edit form
  const handleEditRoleChange = (role: string) => {
    if (!editingUser) return;

    setEditingUser({
      ...editingUser,
      role: role,
      // If changing to operator or editor and no power plant is selected, select the first one
      power_plant_id: (role === 'operator' || role === 'editor') && !editingUser.power_plant_id && powerPlants.length > 0
        ? powerPlants[0].id
        : editingUser.power_plant_id
    });
  }

  const openDeleteModal = (user: User) => {
    setUserToDelete(user)
    setDeleteModalOpen(true)
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      await deleteUser(userToDelete.id)
      setUserToDelete(null)
      setDeleteModalOpen(false)
      toast.success('User deleted successfully')
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    }
  }

  const getRoleInfo = (role: string) => {
    return userRoles.find(r => r.value === role) || userRoles[0];
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <div className="mt-2 text-gray-600 font-medium">Loading users...</div>
          <div className="text-sm text-gray-500">Please wait while we fetch user data</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg border-2 border-dashed border-red-200">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-2" />
          <div className="text-red-800 font-medium">Error Loading Users</div>
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
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage system users and their permissions</p>
          </div>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <UserPlus className="w-4 h-4" />
              <span>Add User</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <span>Add New User</span>
              </DialogTitle>
            </DialogHeader>
            <form className="space-y-4 py-4" autoComplete="off">
              <input type="text" autoComplete="false" name="hidden" style={{ display: 'none' }} />

              {validationError && (
                <div className="flex items-center space-x-2 p-3 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="new-email" className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  id="new-email"
                  name="new-email"
                  type="email"
                  autoComplete="off"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="new-fullName" className="text-sm font-medium text-gray-700">Full Name</label>
                <Input
                  id="new-fullName"
                  name="new-fullName"
                  autoComplete="off"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="new-password" className="text-sm font-medium text-gray-700">Password (min 8 characters)</label>
                <Input
                  id="new-password"
                  name="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newUser.password || ''}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="new-role" className="text-sm font-medium text-gray-700">Role</label>
                <Select value={newUser.role} onValueChange={handleRoleChange}>
                  <SelectTrigger id="new-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {userRoles.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4" />
                          <span>{role.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(newUser.role === 'operator' || newUser.role === 'editor') && (
                  <div className="flex items-center space-x-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    <span>This role requires a power plant assignment.</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="new-powerPlant" className="text-sm font-medium text-gray-700">Power Plant</label>
                <Select
                  value={newUser.power_plant_id?.toString() || "none"}
                  onValueChange={(value) => setNewUser({
                    ...newUser,
                    power_plant_id: value !== "none" ? parseInt(value) : null
                  })}
                >
                  <SelectTrigger id="new-powerPlant">
                    <SelectValue placeholder="Select power plant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="text-gray-500">None</span>
                    </SelectItem>
                    {powerPlants.map(plant => (
                      <SelectItem key={plant.id} value={plant.id.toString()}>
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4" />
                          <span>{plant.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="button" onClick={handleAddUser}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Save User
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>All Users ({users.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Power Plant</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const roleInfo = getRoleInfo(user.role);
                  return (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell className="font-medium text-gray-900">{user.full_name}</TableCell>
                      <TableCell className="text-gray-600">{user.email}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}>
                          <Shield className="w-3 h-3 mr-1" />
                          {roleInfo.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        {user.power_plant_id ? (
                          <div className="flex items-center space-x-1 text-gray-700">
                            <Building2 className="w-4 h-4 text-gray-500" />
                            <span>{powerPlants.find(p => p.id === user.power_plant_id)?.name || 'Unknown'}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {user.is_active ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-green-700 font-medium">Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-red-500" />
                              <span className="text-red-700 font-medium">Inactive</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingUser(user)
                              setValidationError(null)
                              setIsEditDialogOpen(true)
                            }}
                            className="flex items-center space-x-1"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Edit</span>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openDeleteModal(user)}
                            className="flex items-center space-x-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-sm text-gray-500">Get started by adding your first user.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Edit className="w-5 h-5 text-blue-600" />
                <span>Edit User</span>
              </DialogTitle>
            </DialogHeader>
            <form className="space-y-4 py-4" autoComplete="off">
              <input type="text" autoComplete="false" name="hidden" style={{ display: 'none' }} />

              {validationError && (
                <div className="flex items-center space-x-2 p-3 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="edit-email" className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  id="edit-email"
                  name="edit-email"
                  type="email"
                  autoComplete="off"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-fullName" className="text-sm font-medium text-gray-700">Full Name</label>
                <Input
                  id="edit-fullName"
                  name="edit-fullName"
                  autoComplete="off"
                  value={editingUser.full_name}
                  onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-password" className="text-sm font-medium text-gray-700">Password (leave empty to keep unchanged)</label>
                <Input
                  id="edit-password"
                  name="edit-password"
                  type="password"
                  autoComplete="new-password"
                  value={editingUser.password || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  placeholder="Enter new password or leave empty"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-role" className="text-sm font-medium text-gray-700">Role</label>
                <Select value={editingUser.role} onValueChange={handleEditRoleChange}>
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {userRoles.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4" />
                          <span>{role.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(editingUser.role === 'operator' || editingUser.role === 'editor') && (
                  <div className="flex items-center space-x-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    <span>This role requires a power plant assignment.</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-powerPlant" className="text-sm font-medium text-gray-700">Power Plant</label>
                <Select
                  value={editingUser.power_plant_id?.toString() || "none"}
                  onValueChange={(value) => setEditingUser({
                    ...editingUser,
                    power_plant_id: value !== "none" ? parseInt(value) : null
                  })}
                >
                  <SelectTrigger id="edit-powerPlant">
                    <SelectValue placeholder="Select power plant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="text-gray-500">None</span>
                    </SelectItem>
                    {powerPlants.map(plant => (
                      <SelectItem key={plant.id} value={plant.id.toString()}>
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4" />
                          <span>{plant.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-status" className="text-sm font-medium text-gray-700">Status</label>
                <Select
                  value={editingUser.is_active.toString()}
                  onValueChange={(value) => setEditingUser({ ...editingUser, is_active: value === 'true' })}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Active</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="false">
                      <div className="flex items-center space-x-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span>Inactive</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="button" onClick={handleUpdateUser}>
                  <Edit className="w-4 h-4 mr-2" />
                  Update User
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteUser}
          title={`Delete User: ${userToDelete.full_name}`}
          description="This action cannot be undone. This will permanently delete the user account and all associated data."
          itemName={userToDelete.email}
          confirmText="Delete User"
        />
      )}
    </div>
  )
}