-- Revert sensecraft:casting from pg

BEGIN;

DROP TABLE IF EXISTS public.casting;

COMMIT;
