-- Revert sensecraft:game_play_functions from pg

BEGIN;

\set dbm :dbn '__member';
\set dbc :dbn '__client';

DROP INDEX IF EXISTS public.game_play_guild_id_idx;
DROP INDEX IF EXISTS public.game_play_quest_id_idx;

REVOKE SELECT,INSERT,DELETE,UPDATE ON TABLE public.game_play FROM :dbm;
REVOKE SELECT ON TABLE public.game_play FROM :dbc;

DROP POLICY IF EXISTS game_play_update_policy ON public.game_play;
DROP POLICY IF EXISTS game_play_select_policy ON public.game_play;
DROP POLICY IF EXISTS game_play_insert_policy ON public.game_play;
DROP POLICY IF EXISTS game_play_delete_policy ON public.game_play;
ALTER TABLE public.game_play DISABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS before_update_game_play ON public.game_play;
DROP TRIGGER IF EXISTS before_create_game_play ON public.game_play;
DROP FUNCTION IF EXISTS  public.before_createup_game_play();

COMMIT;
