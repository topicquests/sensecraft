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

CREATE OR REPLACE FUNCTION has_play_permission(quest_id INTEGER, perm public.permission) RETURNS boolean AS $$
  SELECT bool_or(hasp) FROM (
    SELECT is_superadmin() AS hasp
    UNION
    SELECT perm = ANY(coalesce(m.permissions, ARRAY[]::permission[]))
        AND (public.is_playing_quest_in_guild(quest_id) IS NOT NULL OR public.is_quest_id_member(quest_id)) AS hasp
        FROM members m WHERE id = current_member_id()
    UNION
    SELECT (coalesce(gm.permissions, ARRAY[]::permission[]) && ARRAY[perm, 'guildAdmin'::permission]) AS hasp
        FROM guild_membership gm
        JOIN casting c ON (
          c.guild_id = gm.guild_id AND
          c.quest_id = quest_id AND
          c.member_id = gm.member_id)
        WHERE gm.member_id = current_member_id() AND
          gm.status = 'confirmed' AND
          gm.guild_id = public.is_playing_quest_in_guild(quest_id)
    UNION
    SELECT perm = ANY(coalesce(c.permissions, ARRAY[]::permission[])) AS hasp
        FROM casting c
        WHERE c.member_id = current_member_id() AND c.quest_id = quest_id
    UNION
    SELECT perm = ANY(coalesce(r.permissions, ARRAY[]::permission[])) AS hasp
        FROM role r
        JOIN casting_role rc ON (r.id = rc.role_id)
        WHERE rc.member_id = current_member_id() AND rc.quest_id = quest_id
    ) q
$$ LANGUAGE SQL STABLE;

COMMIT;
