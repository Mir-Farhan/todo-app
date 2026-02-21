import { Badge } from '@/components/ui/badge'
import type { Priority } from '@/lib/supabase/types'

const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string }
> = {
  critical: { label: 'Critical', color: 'bg-red-500 hover:bg-red-600' },
  high: { label: 'High', color: 'bg-orange-500 hover:bg-orange-600' },
  medium: { label: 'Medium', color: 'bg-yellow-500 hover:bg-yellow-600' },
  low: { label: 'Low', color: 'bg-blue-500 hover:bg-blue-600' },
}

interface PriorityBadgeProps {
  priority: Priority
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority]

  return (
    <Badge className={config.color} variant="default">
      {config.label}
    </Badge>
  )
}
