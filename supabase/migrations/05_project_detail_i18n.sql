-- Versions anglaises des listes du détail projet (le FR reste dans les colonnes d'origine)
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS technical_choices_en jsonb,
  ADD COLUMN IF NOT EXISTS results_en jsonb,
  ADD COLUMN IF NOT EXISTS challenges_en text[];
