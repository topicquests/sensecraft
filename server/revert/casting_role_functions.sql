-- Deploy casting_role_functions


BEGIN;

DROP FUNCTION IF EXISTS public.has_game_role(quest_id integer, guild_id integer, role_id integer);
DROP FUNCTION IF EXISTS public.can_play_role(guild_id integer, role_id integer);
DROP FUNCTION IF EXISTS public.has_play_permission(quest_id INTEGER, perm public.permission);

COMMIT;
