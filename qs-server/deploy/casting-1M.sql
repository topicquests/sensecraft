-- Deploy casting


BEGIN;
ALTER TABLE public.casting
    DROP COLUMN roles;
COMMIT;
