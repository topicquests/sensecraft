-- Revert sensecraft:game_play_functions from pg

BEGIN;

DROP POLICY IF EXISTS game_play_update_policy ON public.game_play;
DROP POLICY IF EXISTS game_play_select_policy ON public.game_play;
DROP POLICY IF EXISTS game_play_insert_policy ON public.game_play;
DROP POLICY IF EXISTS game_play_delete_policy ON public.game_play;
DROP TRIGGER IF EXISTS before_update_game_play ON public.game_play;
DROP TRIGGER IF EXISTS before_create_game_play ON public.game_play;
DROP FUNCTION IF EXISTS  public.before_createup_game_play();

COMMIT;
