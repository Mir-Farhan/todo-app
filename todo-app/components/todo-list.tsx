'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useTodoStore, getFilteredSortedTodos } from '@/stores/todoStore'
import { SortableTodoItem } from './sortable-todo-item'
import { TodoItem } from './todo-item'
import { AddTodoModal } from './add-todo-modal'
import { FilterBar } from './filter-bar'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { Todo } from '@/lib/supabase/types'

export function TodoList() {
  const { todos: allTodos, loading, fetchTodos, toggleComplete, deleteTodo, reorderTodos, saveTodoPositions, sortOption } = useTodoStore()
  const todos = useTodoStore(getFilteredSortedTodos)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  
  // Drag-and-drop only works when sorting by position (manual ordering)
  const canDragAndDrop = sortOption === 'position' && !loading

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  const handleAddTodo = () => {
    setEditingTodo(null)
    setIsModalOpen(true)
  }

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo)
    setIsModalOpen(true)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = allTodos.findIndex((todo) => todo.id === active.id)
      const newIndex = allTodos.findIndex((todo) => todo.id === over.id)

      const reorderedTodos = arrayMove(allTodos, oldIndex, newIndex)
      // Update positions in reordered array
      const updatedTodos = reorderedTodos.map((todo, index) => ({
        ...todo,
        position: index
      }))
      // Update state immediately
      reorderTodos(updatedTodos)
      // Save positions to database in background
      saveTodoPositions(updatedTodos)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <p>Loading todos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Todos</h2>
        <Button onClick={handleAddTodo} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Todo
        </Button>
      </div>

      <FilterBar />

      {todos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold mb-2">No todos yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first todo to get started!
          </p>
          <Button onClick={handleAddTodo} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Todo
          </Button>
        </div>
      ) : canDragAndDrop ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={todos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {todos.map((todo) => (
                <SortableTodoItem
                  key={todo.id}
                  todo={todo}
                  onToggleComplete={toggleComplete}
                  onDelete={deleteTodo}
                  onEdit={handleEditTodo}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="space-y-4">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggleComplete={toggleComplete}
              onDelete={deleteTodo}
              onEdit={handleEditTodo}
            />
          ))}
        </div>
      )}

      <AddTodoModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingTodo={editingTodo}
      />
    </div>
  )
}
