import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'

export type AlertVariant = 'info' | 'error' | 'success' | 'warning' | 'danger'

export interface AlertOptions {
  title?: string
  message: string
  variant?: AlertVariant
  buttonText?: string
}

export interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

interface ModalState {
  isOpen: boolean
  isConfirm: boolean
  title: string
  message: string
  variant: AlertVariant
  confirmText: string
  cancelText: string
}

interface AlertContextValue {
  showAlert: (options: AlertOptions | string) => Promise<void>
  showConfirm: (options: ConfirmOptions | string) => Promise<boolean>
}

const AlertContext = createContext<AlertContextValue | undefined>(undefined)

const DEFAULT_STATE: ModalState = {
  isOpen: false,
  isConfirm: false,
  title: '',
  message: '',
  variant: 'info',
  confirmText: 'OK',
  cancelText: 'Cancel',
}

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<ModalState>(DEFAULT_STATE)
  const resolveRef = useRef<((value: any) => void) | null>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  const showAlert = useCallback((options: AlertOptions | string): Promise<void> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve

      if (typeof options === 'string') {
        setModal({
          isOpen: true,
          isConfirm: false,
          title: 'Notice',
          message: options,
          variant: 'info',
          confirmText: 'OK',
          cancelText: '',
        })
      } else {
        setModal({
          isOpen: true,
          isConfirm: false,
          title: options.title || (options.variant === 'error' ? 'Error' : 'Notice'),
          message: options.message,
          variant: options.variant || 'info',
          confirmText: options.buttonText || 'OK',
          cancelText: '',
        })
      }
    })
  }, [])

  const showConfirm = useCallback((options: ConfirmOptions | string): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve

      if (typeof options === 'string') {
        setModal({
          isOpen: true,
          isConfirm: true,
          title: 'Please Confirm',
          message: options,
          variant: 'danger',
          confirmText: 'Confirm',
          cancelText: 'Cancel',
        })
      } else {
        setModal({
          isOpen: true,
          isConfirm: true,
          title: options.title || 'Please Confirm',
          message: options.message,
          variant: options.variant || 'danger',
          confirmText: options.confirmText || 'Confirm',
          cancelText: options.cancelText || 'Cancel',
        })
      }
    })
  }, [])

  const handleClose = (confirmed: boolean) => {
    setModal((prev) => ({ ...prev, isOpen: false }))
    if (resolveRef.current) {
      resolveRef.current(modal.isConfirm ? confirmed : undefined)
      resolveRef.current = null
    }
  }

  // Keyboard navigation (Escape to cancel, Enter to confirm)
  useEffect(() => {
    if (!modal.isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose(false)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        handleClose(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    // Auto-focus confirm button
    const timer = setTimeout(() => confirmButtonRef.current?.focus(), 50)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      clearTimeout(timer)
    }
  }, [modal.isOpen])

  // Icon based on variant
  const renderIcon = () => {
    switch (modal.variant) {
      case 'error':
        return (
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        )
      case 'danger':
        return (
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        )
      case 'warning':
        return (
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        )
      case 'success':
        return (
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      case 'info':
      default:
        return (
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
    }
  }

  const getConfirmButtonClasses = () => {
    if (modal.variant === 'danger' || modal.variant === 'error') {
      return 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
    }
    if (modal.variant === 'warning') {
      return 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
    }
    return 'bg-heading-light dark:bg-heading-dark text-white dark:text-page-dark hover:opacity-90 shadow-sm'
  }

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      {/* Custom Alert Modal Dialog */}
      {modal.isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose(false)
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <div className="bg-white dark:bg-[#1E1E20] text-heading-light dark:text-heading-dark rounded-3xl w-full max-w-md shadow-2xl p-6 border border-black/5 dark:border-white/10 flex flex-col gap-5 transform transition-all animate-scale-up">
            <div className="flex items-start gap-4">
              {renderIcon()}
              <div className="flex-1 min-w-0 pt-1">
                <h3
                  id="alert-dialog-title"
                  className="text-lg font-medium tracking-tight text-heading-light dark:text-heading-dark leading-snug"
                >
                  {modal.title}
                </h3>
                <p
                  id="alert-dialog-description"
                  className="text-sm text-body-light dark:text-body-dark mt-1.5 leading-relaxed break-words"
                >
                  {modal.message}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {modal.isConfirm && (
                <button
                  type="button"
                  onClick={() => handleClose(false)}
                  className="px-5 py-2.5 rounded-full border border-gray-200 dark:border-neutral-700 text-sm font-medium text-body-light dark:text-body-dark hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  {modal.cancelText}
                </button>
              )}
              <button
                ref={confirmButtonRef}
                type="button"
                onClick={() => handleClose(true)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-opacity ${getConfirmButtonClasses()}`}
              >
                {modal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  )
}

export function useAlert() {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider')
  }
  return context
}

