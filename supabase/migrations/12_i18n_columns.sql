-- fr variants of project detail fields (05 only added _en) and testimonial translations,
-- all declared in src/types.ts and accepted by the JSON import.
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS technical_choices_fr jsonb,
  ADD COLUMN IF NOT EXISTS results_fr jsonb,
  ADD COLUMN IF NOT EXISTS challenges_fr text[];

ALTER TABLE testimonials
  ADD COLUMN IF NOT EXISTS quote_fr text,
  ADD COLUMN IF NOT EXISTS quote_en text,
  ADD COLUMN IF NOT EXISTS author_role_fr text,
  ADD COLUMN IF NOT EXISTS author_role_en text;

NOTIFY pgrst, 'reload schema';
