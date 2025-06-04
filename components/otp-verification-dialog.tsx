"use client"

import { useState, useEffect } from "react"
import { Loader2, Mail, Shield, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface OtpVerificationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (otp: string) => Promise<void>
  itemTitle: string
  contactEmail: string
  isLoading?: boolean
}

export function OtpVerificationDialog({
  isOpen,
  onClose,
  onConfirm,
  itemTitle,
  contactEmail,
  isLoading = false,
}: OtpVerificationDialogProps) {
  const [otp, setOtp] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setOtp("")
      setError(null)
      setIsSubmitting(false)
      setOtpSent(true)
      setCountdown(300) 
    }
  }, [isOpen])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSubmit = async () => {
    if (!otp.trim()) {
      setError("Please enter the OTP")
      return
    }

    if (otp.length !== 6) {
      setError("OTP must be 6 digits")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      await onConfirm(otp)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            Delete Item Confirmation
          </DialogTitle>
          <DialogDescription>You are about to delete "{itemTitle}". This action cannot be undone.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email notification */}
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Mail className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">OTP Sent</p>
              <p className="text-xs text-blue-600">A 6-digit verification code has been sent to {contactEmail}</p>
            </div>
          </div>

          {/* OTP Input */}
          <div className="space-y-2">
            <Label htmlFor="otp" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Enter OTP
            </Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                setOtp(value)
                setError(null)
              }}
              maxLength={6}
              className="text-center text-lg tracking-widest font-mono"
              disabled={isSubmitting}
            />
          </div>

          {/* Countdown */}
          {countdown > 0 && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                OTP expires in: <span className="font-mono font-medium text-red-600">{formatTime(countdown)}</span>
              </p>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Warning */}
          <Alert className="border-amber-200 bg-amber-50">
            <AlertDescription className="text-amber-800">
              <strong>Warning:</strong> This will permanently delete the item from the lost and found database. Make
              sure you have the correct OTP from the email associated with this item.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting} className="border-gray-300">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !otp.trim() || otp.length !== 6}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Item
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
