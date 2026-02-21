-- ============================================
-- Todo List Application Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================

-- Drop existing tables and type for clean re-runs (WARNING: This will delete all data!)
DROP TABLE IF EXISTS public.todo_labels CASCADE;
DROP TABLE IF EXISTS public.labels CASCADE;
DROP TABLE IF EXISTS public.todos CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS priority_enum CASCADE;

CREATE TYPE priority_enum AS ENUM ('critical', 'high', 'medium', 'low');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================
-- TODOS TABLE
-- ============================================

CREATE TABLE public.todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  priority priority_enum DEFAULT 'medium',
  completed BOOLEAN DEFAULT FALSE,
  position INTEGER DEFAULT 0,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================
-- LABELS TABLE
-- ============================================

CREATE TABLE public.labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  is_predefined BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================
-- TODO_LABELS JUNCTION TABLE
-- ============================================

CREATE TABLE public.todo_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  todo_id UUID NOT NULL REFERENCES public.todos(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES public.labels(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Indexes for todos table
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON public.todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_user_id_deleted_at ON public.todos(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_todos_priority ON public.todos(user_id, priority) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON public.todos(user_id, due_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON public.todos(user_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_todos_position ON public.todos(user_id, position) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_todos_completed ON public.todos(user_id, completed) WHERE deleted_at IS NULL;

-- Indexes for labels table
CREATE INDEX IF NOT EXISTS idx_labels_user_id ON public.labels(user_id);
CREATE INDEX IF NOT EXISTS idx_labels_user_id_deleted_at ON public.labels(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_labels_name ON public.labels(user_id, name) WHERE deleted_at IS NULL;

-- Indexes for todo_labels junction table
CREATE INDEX IF NOT EXISTS idx_todo_labels_todo_id ON public.todo_labels(todo_id);
CREATE INDEX IF NOT EXISTS idx_todo_labels_label_id ON public.todo_labels(label_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_todo_labels_unique ON public.todo_labels(todo_id, label_id);

-- Indexes for profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todo_labels ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR PROFILES TABLE
-- ============================================

-- Users can only see their own profile
CREATE POLICY "Users can view own profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id::uuid);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id::uuid);

-- Users can update their own profile
CREATE POLICY "Users can update own profiles"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id::uuid);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profiles"
  ON public.profiles FOR DELETE
  USING (auth.uid() = user_id::uuid);

-- ============================================
-- RLS POLICIES FOR TODOS TABLE
-- ============================================

-- Users can view their own todos
CREATE POLICY "Users can view own todos"
  ON public.todos FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own todos
CREATE POLICY "Users can insert own todos"
  ON public.todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own todos
CREATE POLICY "Users can update own todos"
  ON public.todos FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own todos
CREATE POLICY "Users can delete own todos"
  ON public.todos FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES FOR LABELS TABLE
-- ============================================

-- Users can view their own labels
CREATE POLICY "Users can view own labels"
  ON public.labels FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own labels
CREATE POLICY "Users can insert own labels"
  ON public.labels FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own labels
CREATE POLICY "Users can update own labels"
  ON public.labels FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own labels
CREATE POLICY "Users can delete own labels"
  ON public.labels FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES FOR TODO_LABELS TABLE
-- ============================================

-- Users can view todo labels for their own todos
CREATE POLICY "Users can view own todo labels"
  ON public.todo_labels FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM public.todos WHERE public.todos.id = todo_id));

-- Users can insert todo labels for their own todos
CREATE POLICY "Users can insert own todo labels"
  ON public.todo_labels FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM public.todos WHERE public.todos.id = todo_id));

-- Users can update todo labels for their own todos
CREATE POLICY "Users can update own todo labels"
  ON public.todo_labels FOR UPDATE
  USING (auth.uid() = (SELECT user_id FROM public.todos WHERE public.todos.id = todo_id));

-- Users can delete todo labels for their own todos
CREATE POLICY "Users can delete own todo labels"
  ON public.todo_labels FOR DELETE
  USING (auth.uid() = (SELECT user_id FROM public.todos WHERE public.todos.id = todo_id));

-- ============================================
-- PREDEFINED LABELS
-- ============================================

-- Note: Predefined labels are now created by the application when a new user signs up
-- This avoids NULL constraint issues with user_id
