-- Deploy sensecraft:quests_functions to pg
-- requires: members_functions
-- requires: quests

BEGIN;

\set dbo :dbn '__owner';
\set dbm :dbn '__member';
\set dbc :dbn '__client';


GRANT SELECT,INSERT,UPDATE, DELETE ON TABLE public.quests TO :dbm;
GRANT SELECT ON TABLE public.quests TO :dbc;
GRANT USAGE ON SEQUENCE public.quests_id_seq TO :dbm;


GRANT SELECT ON TABLE public.public_quests TO :dbm;
GRANT SELECT ON TABLE public.public_quests TO :dbc;

GRANT SELECT,INSERT,UPDATE ON TABLE public.quest_membership TO :dbm;
GRANT SELECT ON TABLE public.quest_membership TO :dbc;

--
-- Name: my_quest_memberships; Type: VIEW
--

CREATE OR REPLACE VIEW public.my_quest_memberships AS
 SELECT quest_membership.quest_id,
    quest_membership.member_id,
    quest_membership.confirmed,
    quest_membership.permissions,
    quest_membership.created_at,
    quest_membership.updated_at
   FROM public.quest_membership
  WHERE (quest_membership.member_id = public.current_member_id());

GRANT SELECT ON TABLE public.my_quest_memberships TO :dbm;
GRANT SELECT ON TABLE public.my_quest_memberships TO :dbc;


--
-- Name: is_quest_member(character varying); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.is_quest_member(quest character varying) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
    BEGIN RETURN (SELECT count(*) FROM quest_membership
      JOIN members ON members.id=member_id
      JOIN quests ON quests.id=quest_id
      WHERE quests.handle = quest
      AND confirmed
      AND members.handle = scmember_handle()) > 0;
    END;
    $$;


--
-- Name: has_quest_permission(integer, public.permission); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.has_quest_permission(questid integer, perm public.permission) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
    BEGIN RETURN (SELECT count(*) FROM quest_membership
       JOIN members ON members.id=member_id
       WHERE quest_id = questid
       AND status = 'confirmed'
       AND members.handle = scmember_handle()
       AND (coalesce(quest_membership.permissions, ARRAY[]::permission[]) && ARRAY[perm]
         OR coalesce(members.permissions, ARRAY[]::permission[]) && ARRAY[perm, 'superadmin'::permission])
       ) > 0;
      END;
      $$;


--
-- Name: is_quest_id_member(integer); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.is_quest_id_member(questid integer) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
    BEGIN RETURN (SELECT count(*) FROM quest_membership
      JOIN members ON members.id=member_id
      WHERE quest_id = questid
      AND confirmed
      AND members.handle = scmember_handle()) > 0;
    END;
    $$;


--
-- Name: alter_quest_membership(character varying, character varying, boolean); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.alter_quest_membership(quest character varying, member character varying, adding boolean) RETURNS void
    LANGUAGE plpgsql
    AS $$
    DECLARE curuser varchar;
    BEGIN
      curuser := current_user;
      EXECUTE 'SET LOCAL ROLE ' || current_database() || '__owner';
      IF adding THEN
        EXECUTE 'ALTER GROUP ' || current_database() || '__q_' || quest || ' ADD USER ' || current_database() || '__m_' || member;
      ELSE
        EXECUTE 'ALTER GROUP ' || current_database() || '__q_' || quest || ' DROP USER ' || current_database() || '__m_' || member;
      END IF;
      EXECUTE 'SET LOCAL ROLE ' || curuser;
    END;
    $$;


--
-- Name: after_create_quest(); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.after_create_quest() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE curuser varchar;
    DECLARE member_id integer;
    BEGIN
      member_id := current_member_id();
      IF member_id IS NOT NULL THEN
        curuser := current_user;
        EXECUTE 'SET LOCAL ROLE ' || current_database() || '__owner';
        INSERT INTO quest_membership (quest_id, member_id, confirmed) VALUES (NEW.id, member_id, true);
        EXECUTE 'SET LOCAL ROLE ' || curuser;
      END IF;
      RETURN NEW;
    END;
    $$;

CREATE TRIGGER after_create_quest AFTER INSERT ON public.quests FOR EACH ROW EXECUTE FUNCTION public.after_create_quest();


--
-- Name: after_delete_quest(); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.after_delete_quest() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE curuser varchar;
    DECLARE questrole varchar;
    BEGIN
      questrole := current_database() || '__q_' || OLD.handle;
      curuser := current_user;
      EXECUTE 'SET LOCAL ROLE ' || current_database() || '__owner';
      EXECUTE 'DROP ROLE ' || questrole;
      EXECUTE 'SET LOCAL ROLE ' || curuser;
      RETURN NEW;
    END;
    $$;

CREATE TRIGGER after_delete_quest AFTER DELETE ON public.quests FOR EACH ROW EXECUTE FUNCTION public.after_delete_quest();

--
-- Name: before_create_quest(); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.before_create_quest() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE curuser varchar;
    DECLARE questrole varchar;
    BEGIN
      questrole := current_database() || '__q_' || NEW.handle;
      NEW.creator := current_member_id();
      curuser := current_user;
      EXECUTE 'SET LOCAL ROLE ' || current_database() || '__owner';
      EXECUTE 'CREATE ROLE ' || questrole;
      EXECUTE 'ALTER GROUP ' || questrole || ' ADD USER ' || current_database() || '__client';
      EXECUTE 'SET LOCAL ROLE ' || curuser;
      RETURN NEW;
    END;
    $$;

CREATE TRIGGER before_create_quest BEFORE INSERT ON public.quests FOR EACH ROW EXECUTE FUNCTION public.before_create_quest();


--
-- Name: before_update_quest(); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.before_update_quest() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
      IF NEW.handle <> OLD.handle THEN
        RETURN NULL;
      END IF;
      NEW.updated_at := now();
      RETURN NEW;
    END;
    $$;

CREATE TRIGGER before_update_quest BEFORE UPDATE ON public.quests FOR EACH ROW EXECUTE FUNCTION public.before_update_quest();


--
-- Name: after_delete_quest_membership(); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.after_delete_quest_membership() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE curuser varchar;
    DECLARE questrole varchar;
    DECLARE memberrole varchar;
    BEGIN
      SELECT handle INTO memberrole FROM members WHERE id=OLD.member_id;
      SELECT handle INTO questrole FROM quests WHERE id=OLD.quest_id;
      IF questrole IS NOT NULL AND memberrole IS NOT NULL THEN
        curuser := current_user;
        EXECUTE 'SET LOCAL ROLE ' || current_database() || '__owner';
        EXECUTE 'ALTER GROUP ' || current_database() || '__q_' || questrole || ' DROP USER ' || current_database() || '__m_' || memberrole;
        EXECUTE 'SET LOCAL ROLE ' || curuser;
      END IF;
      RETURN OLD;
    END;
    $$;

CREATE TRIGGER after_delete_quest_membership AFTER DELETE ON public.quest_membership FOR EACH ROW EXECUTE FUNCTION public.after_delete_quest_membership();


--
-- Name: before_createup_quest_membership(); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.before_createup_quest_membership() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE quest varchar;
    DECLARE member varchar;
    BEGIN
      SELECT handle INTO STRICT quest FROM quests WHERE id=NEW.quest_id;
      SELECT handle INTO STRICT member FROM members WHERE id=NEW.member_id;
      IF member IS NOT NULL AND quest IS NOT NULL THEN
        PERFORM alter_quest_membership(quest, member, NEW.confirmed);
      END IF;
      NEW.updated_at := now();
      RETURN NEW;
    END;
    $$;

CREATE TRIGGER before_create_quest_membership BEFORE INSERT ON public.quest_membership FOR EACH ROW EXECUTE FUNCTION public.before_createup_quest_membership();
CREATE TRIGGER before_update_quest_membership BEFORE UPDATE ON public.quest_membership FOR EACH ROW EXECUTE FUNCTION public.before_createup_quest_membership();


--
-- quests policies
--

ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY quest_update_policy ON public.quests FOR UPDATE USING (public.is_quest_id_member(id));
CREATE POLICY quests_insert_policy ON public.quests FOR INSERT WITH CHECK (public.has_permission('createQuest'));
CREATE POLICY quests_select_policy ON public.quests FOR SELECT USING ((public OR (creator = public.current_member_id()) OR (id IN ( SELECT my_quest_memberships.quest_id
   FROM public.my_quest_memberships
  WHERE my_quest_memberships.confirmed))));
CREATE POLICY quests_delete_policy ON public.quests FOR DELETE USING (public.has_permission('superadmin'));


--
-- quest_membership Policies
--

ALTER TABLE public.quest_membership ENABLE ROW LEVEL SECURITY;

CREATE POLICY quest_membership_select_policy ON public.quest_membership FOR SELECT USING (((member_id = public.current_member_id()) OR (( SELECT public_quests.id
   FROM public.public_quests
  WHERE (public_quests.id = quest_membership.quest_id)) IS NOT NULL) OR (quest_id IN ( SELECT my_quest_memberships.quest_id
   FROM public.my_quest_memberships
  WHERE my_quest_memberships.confirmed))));

CREATE POLICY quest_membership_update_policy ON public.quest_membership FOR UPDATE USING (public.is_quest_id_member(quest_id));
CREATE POLICY quest_membership_delete_policy ON public.quest_membership FOR DELETE USING (public.has_quest_permission(quest_id, 'revokeQuestMembership'));
CREATE POLICY quest_membership_insert_policy ON public.quest_membership FOR INSERT WITH CHECK (((public.current_member_id() = member_id) OR public.has_quest_permission(quest_id, 'proposeQuestMembership'::public.permission)));

COMMIT;