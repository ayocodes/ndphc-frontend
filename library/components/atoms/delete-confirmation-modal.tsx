'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './dialog'
import { Button } from './button'
import { Input } from './input'
import { AlertCircle } from 'lucide-react'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  itemName: string
  confirmText?: string
  cancelText?: string
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description = "This action cannot be undone. This will permanently delete this item.",
  itemName,
  confirmText = "Delete",
  cancelText = "Cancel"
}: DeleteConfirmationModalProps) {
  const [inputValue, setInputValue] = useState('')
  const [isButtonDisabled, setIsButtonDisabled] = useState(true)

  // Reset input value when modal opens or closes
  useEffect(() => {
    setInputValue('')
    setIsButtonDisabled(true)
  }, [isOpen])

  // Check if input matches item name
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setIsButtonDisabled(value !== itemName)
  }

  // Handle confirm action
  const handleConfirm = () => {
    if (inputValue === itemName) {
      onConfirm()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600">{description}</p>

          <div className="border border-gray-200 bg-gray-50 rounded-md p-3">
            <p className="text-sm font-medium mb-2">Please type <span className="font-bold">{itemName}</span> to confirm</p>
            <Input
              value={inputValue}
              onChange={handleInputChange}
              placeholder={`Type "${itemName}" to confirm`}
              className={`${!isButtonDisabled ? 'border-green-500' : ''}`}
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isButtonDisabled}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 