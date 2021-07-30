-- Deploy sensecraft:game_play_functions to pg
-- requires: game_play
-- requires: guilds_functions
-- requires: quests_functions

BEGIN;

\set dbo :dbn '__owner';
\set dbm :dbn '__member';
\set dbc :dbn '__client';

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.game_play TO :dbm;
GRANT SELECT ON TABLE public.game_play TO :dbc;


--
-- Name: before_createup_game_play(); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.before_createup_game_play() RETURNS trigger
    LANGUAGE plpgsql
    AS $$ 
    DECLARE is_requested boolean;
    DECLARE is_invited boolean;
    DECLARE is_quest_member boolean;
    DECLARE has_join_permission boolean;
    DECLARE quest_status quest_status;
    BEGIN 
      IF OLD IS NOT NULL THEN
        NEW.quest_id = OLD.quest_id;
        NEW.guild_id = OLD.guild_id;
      END IF;
      SELECT status INTO STRICT quest_status FROM quests where quests.id = NEW.quest_id;
      SELECT is_quest_id_member(NEW.quest_id) INTO STRICT is_quest_member;
      is_requested := NOT (OLD IS NULL OR OLD.status = 'invitation');
      is_invited := NOT (OLD IS NULL OR OLD.status = 'request');
      has_join_permission := has_guild_permission(NEW.guild_id, 'joinQuest'::permission);
      IF has_join_permission
         AND (quest_status = 'registration' OR quest_status = 'ongoing' OR quest_status = 'paused') THEN
        is_requested := is_requested OR (NEW.status != 'invitation');
      ELSE
        IF (OLD IS NULL OR OLD.status != NEW.status) AND NOT is_quest_member THEN
          RETURN NULL;
        END IF;
      END IF;
      -- this version if quest does not auto-accept guilds
      -- IF is_quest_member THEN
      IF is_quest_member OR has_join_permission THEN
        is_invited := is_invited OR (NEW.status != 'request');
      END IF;
      IF is_requested THEN
        IF is_invited THEN
          NEW.status := 'confirmed';
        ELSE
          NEW.status := 'request';
        END IF;
      ELSE
        IF is_invited THEN
          NEW.status := 'invitation';
        ELSE
          return NULL;
        END IF;
      END IF;
      NEW.updated_at := now();
      RETURN NEW;
    END;
    $$;


CREATE TRIGGER before_create_game_play BEFORE INSERT ON public.game_play FOR EACH ROW EXECUTE FUNCTION public.before_createup_game_play();
CREATE TRIGGER before_update_game_play BEFORE UPDATE ON public.game_play FOR EACH ROW EXECUTE FUNCTION public.before_createup_game_play();


--
-- game_play policies
--

ALTER TABLE public.game_play ENABLE ROW LEVEL SECURITY;

CREATE POLICY game_play_delete_policy ON public.game_play FOR DELETE USING ((public.is_quest_id_member(quest_id) OR public.has_guild_permission(guild_id, 'joinQuest'::public.permission)));
CREATE POLICY game_play_insert_policy ON public.game_play FOR INSERT WITH CHECK ((public.is_quest_id_member(quest_id) OR public.has_guild_permission(guild_id, 'joinQuest'::public.permission)));
CREATE POLICY game_play_select_policy ON public.game_play FOR SELECT USING (((( SELECT guilds.public
   FROM public.guilds
  WHERE (guilds.id = game_play.guild_id)) AND ( SELECT quests.public
   FROM public.quests
  WHERE (quests.id = game_play.quest_id))) OR public.is_guild_id_member(guild_id) OR public.is_quest_id_member(quest_id)));
CREATE POLICY game_play_update_policy ON public.game_play FOR UPDATE USING ((public.is_quest_id_member(quest_id) OR public.has_guild_permission(guild_id, 'joinQuest'::public.permission)));

COMMIT;
