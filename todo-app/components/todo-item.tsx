'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PriorityBadge } from '@/components/priority-badge'
import { LabelBadge } from '@/components/label-badge'
import { formatDate, isOverdue } from '@/lib/utils'
import { Pencil, Trash2, Calendar, GripVertical } from 'lucide-react'
import type { Todo } from '@/lib/supabase/types'

interface TodoItemProps {
  todo: Todo
  onToggleComplete: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (todo: Todo) => void
  dragHandleProps?: any
}

export function TodoItem({ todo, onToggleComplete, onDelete, onEdit, dragHandleProps }: TodoItemProps) {
  const overdue = todo.due_date && isOverdue(todo.due_date)

  return (
    <Card className={`p-4 transition-all hover:shadow-md ${todo.completed ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        {dragHandleProps && (
          <div
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing mt-1 text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="h-5 w-5" />
          </div>
        )}
        <Checkbox
          checked={todo.completed}
          onCheckedChange={() => onToggleComplete(todo.id)}
          className="mt-1"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3
              className={`font-semibold ${
                todo.completed ? 'line-through text-muted-foreground' : ''
              }`}
            >
              {todo.title}
            </h3>
            <PriorityBadge priority={todo.priority} />
          </div>

          {todo.description && (
            <p className="text-sm text-muted-foreground mb-2">
              {todo.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {todo.labels && todo.labels.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {todo.labels.map((label) => (
                  <LabelBadge key={label.id} label={label} />
                ))}
              </div>
            )}

            {todo.due_date && (
              <span
                className={`text-xs flex items-center gap-1 ${
                  overdue
                    ? 'text-red-500 font-medium'
                    : 'text-muted-foreground'
                }`}
              >
                <Calendar className="h-3 w-3" />
                {overdue && 'Overdue: '}
                {formatDate(todo.due_date)}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(todo)}
            className="h-8 w-8"
            aria-label="Edit todo"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(todo.id)}
            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
            aria-label="Delete todo"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
