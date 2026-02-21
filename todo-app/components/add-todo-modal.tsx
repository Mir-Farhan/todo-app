'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useTodoStore } from '@/stores/todoStore'
import { useLabelStore } from '@/stores/labelStore'
import { PriorityBadge } from './priority-badge'
import { LabelBadge } from './label-badge'
import type { Todo, Priority } from '@/lib/supabase/types'

interface AddTodoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingTodo?: Todo | null
}

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

export function AddTodoModal({ open, onOpenChange, editingTodo }: AddTodoModalProps) {
  const { createTodo, updateTodo } = useTodoStore()
  const { labels, fetchLabels } = useLabelStore()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      fetchLabels()
    }
  }, [open, fetchLabels])

  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title)
      setDescription(editingTodo.description || '')
      setDueDate(editingTodo.due_date ? editingTodo.due_date.split('T')[0] : '')
      setPriority(editingTodo.priority)
      setSelectedLabels(editingTodo.labels?.map((l) => l.id) || [])
    } else {
      resetForm()
    }
  }, [editingTodo, open])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setDueDate('')
    setPriority('medium')
    setSelectedLabels([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)

    try {
      if (editingTodo) {
        await updateTodo(editingTodo.id, {
          title: title.trim(),
          description: description.trim() || null,
          due_date: dueDate ? new Date(dueDate).toISOString() : null,
          priority,
        })
      } else {
        await createTodo({
          user_id: '', // Will be set by the store
          title: title.trim(),
          description: description.trim() || null,
          due_date: dueDate ? new Date(dueDate).toISOString() : null,
          priority,
          completed: false,
          position: 0, // Will be set by the store
          labels: selectedLabels.map((labelId) => {
            const label = labels.find((l) => l.id === labelId)
            return label || { id: labelId, user_id: '', name: '', color: '', is_predefined: false, deleted_at: null, created_at: '' }
          }),
        })
      }
      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error('Error saving todo:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleLabel = (labelId: string) => {
    setSelectedLabels((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editingTodo ? 'Edit Todo' : 'Create New Todo'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add more details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <div className="flex flex-wrap gap-2">
                {PRIORITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPriority(option.value)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      priority === option.value
                        ? 'ring-2 ring-primary ring-offset-2'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <PriorityBadge priority={option.value} />
                  </button>
                ))}
              </div>
            </div>

            {labels.length > 0 && (
              <div className="space-y-2">
                <Label>Labels</Label>
                <div className="flex flex-wrap gap-2">
                  {labels.map((label) => (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() => toggleLabel(label.id)}
                      className={`rounded-md transition-all ${
                        selectedLabels.includes(label.id)
                          ? 'ring-2 ring-primary ring-offset-2 scale-105'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <LabelBadge label={label} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? 'Saving...' : editingTodo ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
