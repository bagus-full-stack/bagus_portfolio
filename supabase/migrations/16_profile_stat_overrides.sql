-- Optional manual values for the About counters; NULL = computed from experiences/projects.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS years_experience_override integer CHECK (years_experience_override BETWEEN 0 AND 80),
  ADD COLUMN IF NOT EXISTS projects_count_override integer CHECK (projects_count_override BETWEEN 0 AND 10000);

NOTIFY pgrst, 'reload schema';
