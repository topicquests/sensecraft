-- Deploy casting_role_functions
-- requires: casting_role
-- idempotent

BEGIN;

--
-- Name: has_game_role(integer, integer, integer); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.has_game_role(quest_id integer, guild_id integer, role_id integer) RETURNS boolean AS $$
BEGIN
  IF current_member_id() IS NULL THEN
    RETURN false;
  ELSE
    RETURN (SELECT count(*) > 0 FROM public.casting_role
        WHERE
          casting_role.role_id = has_game_role.role_id AND
          casting_role.member_id = current_member_id() AND
          casting_role.quest_id = has_game_role.quest_id AND
          casting_role.guild_id = has_game_role.guild_id);
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

--
-- Name: can_play_role(integer, integer); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.can_play_role(guild_id integer, role_id integer) RETURNS boolean AS $$
BEGIN
  IF current_member_id() IS NULL THEN
    RETURN false;
  ELSE
    RETURN (SELECT count(*) > 0 FROM public.guild_member_available_role AS r
        WHERE
          r.role_id = can_play_role.role_id AND
          r.member_id = current_member_id() AND
          r.guild_id = can_play_role.guild_id);
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

COMMIT;
