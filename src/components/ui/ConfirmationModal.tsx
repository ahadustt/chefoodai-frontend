import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from './Button'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  icon?: React.ReactNode
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  icon
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const variantStyles = {
    danger: {
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
      overlay: 'bg-red-50/20'
    },
    warning: {
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      confirmButton: 'bg-amber-600 hover:bg-amber-700 text-white',
      overlay: 'bg-amber-50/20'
    },
    info: {
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
      overlay: 'bg-blue-50/20'
    }
  }

  const currentVariant = variantStyles[variant]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 backdrop-blur-lg z-50 flex items-center justify-center p-4 ${currentVariant.overlay}`}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white border border-white/20 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-6 pb-4">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100/50 hover:bg-gray-200/50 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
              
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full ${currentVariant.iconBg} flex items-center justify-center flex-shrink-0`}>
                  {icon || <AlertTriangle className={`h-6 w-6 ${currentVariant.iconColor}`} />}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {title}
                  </h3>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              <p className="text-gray-600 leading-relaxed mb-6">
                {message}
              </p>

              {/* Actions */}
              <div className="flex space-x-3">
                <Button
                  onClick={onClose}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0"
                >
                  {cancelText}
                </Button>
                <Button
                  onClick={handleConfirm}
                  className={`flex-1 ${currentVariant.confirmButton} border-0 shadow-lg`}
                >
                  {confirmText}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 