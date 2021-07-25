-- Revert sensecraft:game_play from pg

BEGIN;

DROP POLICY IF EXISTS game_play_update_policy ON public.game_play;
DROP POLICY IF EXISTS game_play_select_policy ON public.game_play;
DROP POLICY IF EXISTS game_play_insert_policy ON public.game_play;
DROP POLICY IF EXISTS game_play_delete_policy ON public.game_play;
ALTER TABLE IF EXISTS ONLY public.game_play DROP CONSTRAINT IF EXISTS game_play_quest_id_fkey;
ALTER TABLE IF EXISTS ONLY public.game_play DROP CONSTRAINT IF EXISTS game_play_guild_id_fkey;
DROP TRIGGER IF EXISTS before_update_game_play ON public.game_play;
DROP TRIGGER IF EXISTS before_create_game_play ON public.game_play;
ALTER TABLE IF EXISTS ONLY public.game_play DROP CONSTRAINT IF EXISTS game_play_pkey;
DROP TABLE IF EXISTS public.game_play;
DROP FUNCTION IF EXISTS  public.before_createup_game_play();

COMMIT;
