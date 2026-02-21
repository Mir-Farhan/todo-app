import { Badge } from '@/components/ui/badge'
import type { Label } from '@/lib/supabase/types'

interface LabelBadgeProps {
  label: Label
}

export function LabelBadge({ label }: LabelBadgeProps) {
  return (
    <Badge
      variant="outline"
      style={{
        borderColor: label.color,
        color: label.color,
      }}
      className="text-xs"
    >
      {label.name}
    </Badge>
  )
}
