-- Revert sensecraft:game_play from pg

BEGIN;

DROP TABLE IF EXISTS public.game_play;

COMMIT;
