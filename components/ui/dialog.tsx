"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => onOpenChange?.(false)}
    >
      <div className="fixed inset-0 bg-black/50" />
      <div
        className="relative z-50 bg-card rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)}
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("text-lg font-semibold leading-none", className)}
      {...props}
    />
  )
}

function DialogContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("p-6 pt-0", className)} {...props} />
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center justify-end gap-2 p-6 pt-4 border-t", className)}
      {...props}
    />
  )
}

export { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter }

