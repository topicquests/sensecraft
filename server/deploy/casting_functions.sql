-- Deploy sensecraft:casting_functions to pg
-- requires: casting
-- requires: guilds_functions
-- requires: quests_functions
-- requires: game_play
-- idempotent

BEGIN;

\set dbo :dbn '__owner';
\set dbm :dbn '__member';
\set dbc :dbn '__client';

--
-- Name: is_playing_quest_in_guild(integer); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.is_playing_quest_in_guild(quest_id integer) RETURNS INTEGER AS $$
  SELECT guild_id FROM public.casting c
        WHERE
          c.member_id = current_member_id() AND
          c.quest_id = quest_id LIMIT 1;
$$ LANGUAGE sql STABLE;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.casting TO :dbm;
GRANT SELECT ON TABLE public.casting TO :dbc;

CREATE OR REPLACE FUNCTION public.register_all_members(questid INTEGER, guildid INTEGER) RETURNS void
LANGUAGE plpgsql AS
$$
BEGIN
  IF (SELECT COUNT(*) FROM public.game_play WHERE quest_id = questid AND guild_id = guildid AND status='confirmed') > 0 THEN
    INSERT INTO public.casting (member_id, quest_id, guild_id, permissions) (
      SELECT member_id, questid, guildid, ARRAY[]::permission[] FROM public.guild_membership
      WHERE guild_id = guildid AND status='confirmed') ON CONFLICT DO NOTHING;
  END IF;
END$$;

--
-- Name: before_update_casting(); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.before_update_casting() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
      -- cannot change primary key
      NEW.guild_id = OLD.guild_id;
      NEW.quest_id = OLD.quest_id;
      NEW.member_id = OLD.member_id;
      IF NEW.permissions != OLD.permissions AND NOT public.has_guild_permission(NEW.guild_id, 'guildAdmin') THEN
        RAISE EXCEPTION 'permission guildAdmin / change casting permissions';
      END IF;
      RETURN NEW;
    END;
    $$;

DROP TRIGGER IF EXISTS before_update_casting ON public.casting;
CREATE TRIGGER before_update_casting BEFORE UPDATE ON public.casting FOR EACH ROW EXECUTE FUNCTION public.before_update_casting();

ALTER TABLE public.casting ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS casting_delete_policy ON public.casting;
CREATE POLICY casting_delete_policy ON public.casting FOR DELETE USING ((
  member_id = public.current_member_id() OR
  public.is_quest_id_member(quest_id) OR
  public.has_guild_permission(guild_id, 'guildAdmin'::public.permission)));
DROP POLICY IF EXISTS casting_insert_policy ON public.casting;
CREATE POLICY casting_insert_policy ON public.casting FOR INSERT WITH CHECK (
  ((member_id = current_member_id() AND public.is_guild_id_member(guild_id)) OR public.is_guild_id_leader(guild_id))
  AND NOT public.is_quest_id_member(quest_id)
  AND (SELECT COUNT(*) FROM public.game_play WHERE quest_id = quest_id AND guild_id = guild_id AND status='confirmed') > 0);
DROP POLICY IF EXISTS casting_select_policy ON public.casting;
CREATE POLICY casting_select_policy ON public.casting FOR SELECT USING (((( SELECT guilds.public
   FROM public.guilds
  WHERE (guilds.id = casting.guild_id)) AND ( SELECT quests.public
   FROM public.quests
  WHERE (quests.id = casting.quest_id))) OR public.is_guild_id_member(guild_id) OR public.is_quest_id_member(quest_id)));
DROP POLICY IF EXISTS casting_update_policy ON public.casting;
CREATE POLICY casting_update_policy ON public.casting FOR UPDATE USING (
  (member_id = current_member_id() AND public.is_guild_id_member(guild_id)) OR public.is_guild_id_leader(guild_id));

DROP INDEX IF EXISTS public.casting_member_id_idx;
CREATE INDEX casting_member_id_idx ON casting USING HASH (member_id);

DROP INDEX IF EXISTS public.casting_guild_id_idx;
CREATE INDEX casting_guild_id_idx ON casting USING HASH (guild_id);

DROP INDEX IF EXISTS public.casting_quest_id_idx;
CREATE INDEX casting_quest_id_idx ON casting USING HASH (quest_id);

COMMIT;
