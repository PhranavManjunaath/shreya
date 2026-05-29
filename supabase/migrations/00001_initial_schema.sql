-- GrindTracker Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── profiles ──────────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'Grinder',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Automatically create a profile on signup
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Grinder'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── tasks ─────────────────────────────────────────────────────────────────────
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section TEXT NOT NULL CHECK (section IN ('gym', 'work', 'habits')),
  text TEXT NOT NULL,
  done BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own tasks"
  ON tasks FOR ALL USING (auth.uid() = user_id);

-- ── journal ───────────────────────────────────────────────────────────────────
CREATE TABLE journal (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE journal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own journal"
  ON journal FOR ALL USING (auth.uid() = user_id);

-- ── history ──────────────────────────────────────────────────────────────────
CREATE TABLE history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  gym INT NOT NULL DEFAULT 0,
  work INT NOT NULL DEFAULT 0,
  habits INT NOT NULL DEFAULT 0,
  pct INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own history"
  ON history FOR ALL USING (auth.uid() = user_id);

-- ── water_log ─────────────────────────────────────────────────────────────────
CREATE TABLE water_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE water_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own water_log"
  ON water_log FOR ALL USING (auth.uid() = user_id);

-- ── weight_log ────────────────────────────────────────────────────────────────
CREATE TABLE weight_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  kg NUMERIC(5,1) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE weight_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own weight_log"
  ON weight_log FOR ALL USING (auth.uid() = user_id);

-- ── unique constraints for upsert ─────────────────────────────────────────────
ALTER TABLE history ADD CONSTRAINT history_user_date_unique UNIQUE (user_id, date);
ALTER TABLE water_log ADD CONSTRAINT water_log_user_date_unique UNIQUE (user_id, date);

-- ── indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_tasks_user ON tasks(user_id);
CREATE INDEX idx_journal_user ON journal(user_id);
CREATE INDEX idx_water_log_user_date ON water_log(user_id, date);
CREATE INDEX idx_weight_log_user ON weight_log(user_id);
CREATE INDEX idx_tasks_created ON tasks(created_at DESC);
