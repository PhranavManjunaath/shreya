-- workout_days
CREATE TABLE workout_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  exercises JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE workout_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own workout_days"
  ON workout_days FOR ALL USING (auth.uid() = user_id);

-- workout_logs
CREATE TABLE workout_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  exercise TEXT NOT NULL,
  sets JSONB NOT NULL DEFAULT '[]',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own workout_logs"
  ON workout_logs FOR ALL USING (auth.uid() = user_id);

-- calorie_logs
CREATE TABLE calorie_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  breakfast INT NOT NULL DEFAULT 0,
  lunch INT NOT NULL DEFAULT 0,
  dinner INT NOT NULL DEFAULT 0,
  snacks INT NOT NULL DEFAULT 0,
  total INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE calorie_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own calorie_logs"
  ON calorie_logs FOR ALL USING (auth.uid() = user_id);

-- macro_ratios
CREATE TABLE macro_ratios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  protein INT NOT NULL DEFAULT 30,
  carbs INT NOT NULL DEFAULT 40,
  fat INT NOT NULL DEFAULT 30,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE macro_ratios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own macro_ratios"
  ON macro_ratios FOR ALL USING (auth.uid() = user_id);

-- unique constraints for upsert
ALTER TABLE calorie_logs ADD CONSTRAINT calorie_logs_user_date_unique UNIQUE (user_id, date);

-- indexes
CREATE INDEX idx_workout_days_user ON workout_days(user_id);
CREATE INDEX idx_workout_logs_user ON workout_logs(user_id);
CREATE INDEX idx_calorie_logs_user_date ON calorie_logs(user_id, date);
CREATE INDEX idx_macro_ratios_user ON macro_ratios(user_id);
