"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type="checkbox"
      data-slot="checkbox"
      className={cn(
        "h-4 w-4 rounded border-input text-primary focus-visible:ring-ring/50 focus-visible:ring-[3px] cursor-pointer",
        className
      )}
      {...props}
    />
  )
}

export { Checkbox }

