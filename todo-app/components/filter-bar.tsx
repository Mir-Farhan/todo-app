'use client'

import { useState, useEffect } from 'react'
import { useTodoStore } from '@/stores/todoStore'
import { useLabelStore } from '@/stores/labelStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LabelBadge } from './label-badge'
import { PriorityBadge } from './priority-badge'
import { ArrowUpDown, Search, Filter, X, Check } from 'lucide-react'
import type { Priority, SortOption } from '@/lib/supabase/types'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'position', label: 'Manual Order' },
  { value: 'due_date_asc', label: 'Due Date (Earliest First)' },
  { value: 'due_date_desc', label: 'Due Date (Latest First)' },
  { value: 'priority_desc', label: 'Priority (High to Low)' },
  { value: 'priority_asc', label: 'Priority (Low to High)' },
  { value: 'created_desc', label: 'Created (Newest First)' },
  { value: 'created_asc', label: 'Created (Oldest First)' },
]

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

export function FilterBar() {
  const { sortOption, setSortOption, filterOptions, setFilterOptions } = useTodoStore()
  const { labels, fetchLabels } = useLabelStore()

  const [searchQuery, setSearchQuery] = useState(filterOptions.search || '')
  const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>(filterOptions.priority || [])
  const [selectedLabels, setSelectedLabels] = useState<string[]>(filterOptions.labels || [])
  const [completedFilter, setCompletedFilter] = useState<boolean | null>(filterOptions.completed ?? null)

  useEffect(() => {
    fetchLabels()
  }, [fetchLabels])

  useEffect(() => {
    setSearchQuery(filterOptions.search || '')
    setSelectedPriorities(filterOptions.priority || [])
    setSelectedLabels(filterOptions.labels || [])
    setCompletedFilter(filterOptions.completed ?? null)
  }, [filterOptions])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setFilterOptions({ search: value || undefined })
  }

  const togglePriority = (priority: Priority) => {
    const newPriorities = selectedPriorities.includes(priority)
      ? selectedPriorities.filter((p) => p !== priority)
      : [...selectedPriorities, priority]
    setSelectedPriorities(newPriorities)
    setFilterOptions({ priority: newPriorities.length > 0 ? newPriorities : undefined })
  }

  const toggleLabel = (labelId: string) => {
    const newLabels = selectedLabels.includes(labelId)
      ? selectedLabels.filter((id) => id !== labelId)
      : [...selectedLabels, labelId]
    setSelectedLabels(newLabels)
    setFilterOptions({ labels: newLabels.length > 0 ? newLabels : undefined })
  }

  const setCompleted = (value: boolean | null) => {
    setCompletedFilter(value)
    setFilterOptions({ completed: value === null ? undefined : value })
  }

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedPriorities([])
    setSelectedLabels([])
    setCompleted(null)
    setFilterOptions({})
  }

  const hasActiveFilters =
    searchQuery || selectedPriorities.length > 0 || selectedLabels.length > 0 || completedFilter !== null

  const currentSortLabel = SORT_OPTIONS.find((opt) => opt.value === sortOption)?.label || 'Sort'

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search todos..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 min-w-[180px] justify-between">
              <ArrowUpDown className="h-4 w-4" />
              <span className="truncate">{currentSortLabel}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {SORT_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setSortOption(option.value)}
                className="justify-between"
              >
                <span>{option.label}</span>
                {sortOption === option.value && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearAllFilters} className="gap-2">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Priority Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={selectedPriorities.length > 0 ? 'default' : 'outline'}
              size="sm"
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Priority
              {selectedPriorities.length > 0 && (
                <span className="ml-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-1.5 rounded-full text-xs shadow-sm">
                  {selectedPriorities.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {PRIORITY_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => togglePriority(option.value)}
                className="justify-between"
              >
                <PriorityBadge priority={option.value} />
                {selectedPriorities.includes(option.value) && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Labels Filter */}
        {labels.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={selectedLabels.length > 0 ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Labels
                {selectedLabels.length > 0 && (
                  <span className="ml-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-1.5 rounded-full text-xs shadow-sm">
                    {selectedLabels.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
              <DropdownMenuLabel>Filter by Labels</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {labels.map((label) => (
                <DropdownMenuItem
                  key={label.id}
                  onClick={() => toggleLabel(label.id)}
                  className="justify-between"
                >
                  <LabelBadge label={label} />
                  {selectedLabels.includes(label.id) && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Completed Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={completedFilter !== null ? 'default' : 'outline'}
              size="sm"
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setCompleted(null)} className="justify-between">
              All
              {completedFilter === null && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCompleted(false)} className="justify-between">
              Active
              {completedFilter === false && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCompleted(true)} className="justify-between">
              Completed
              {completedFilter === true && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Active Priority Badges */}
        {selectedPriorities.map((priority) => (
          <button
            key={priority}
            onClick={() => togglePriority(priority)}
            className="rounded-md transition-all hover:opacity-70"
          >
            <PriorityBadge priority={priority} />
          </button>
        ))}

        {/* Active Label Badges */}
        {selectedLabels.map((labelId) => {
          const label = labels.find((l) => l.id === labelId)
          if (!label) return null
          return (
            <button
              key={labelId}
              onClick={() => toggleLabel(labelId)}
              className="rounded-md transition-all hover:opacity-70"
            >
              <LabelBadge label={label} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
