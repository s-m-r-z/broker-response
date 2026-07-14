'use client'

import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip'

interface InfoTooltipProps {
  content: string
  children: React.ReactNode
}

// Thin wrapper around the Radix tooltip primitives so call sites across the
// app (badges, cards, nav rows) can attach an explanatory tooltip in one line
// instead of repeating Tooltip/TooltipTrigger/TooltipContent boilerplate.
export function InfoTooltip({ content, children }: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{content}</TooltipContent>
    </Tooltip>
  )
}
