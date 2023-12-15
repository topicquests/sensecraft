-- Deploy casting


BEGIN;
ALTER TABLE public.casting
    DROP COLUMN roles;
DROP TYPE IF EXISTS public.member_role;
COMMIT;
