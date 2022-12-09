-- Deploy sensecraft:guilds_functions to pg
-- requires: members_functions
-- requires: guilds
-- requires: casting_role
-- idempotent

BEGIN;

\set dbo :dbn '__owner';
\set dbm :dbn '__member';
\set dbc :dbn '__client';

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.guilds TO :dbm;
GRANT SELECT ON TABLE public.guilds TO :dbc;
GRANT USAGE ON SEQUENCE public.guilds_id_seq TO :dbm;

GRANT SELECT ON TABLE public.public_guilds TO :dbm;
GRANT SELECT ON TABLE public.public_guilds TO :dbc;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.guild_membership TO :dbm;
GRANT SELECT ON TABLE public.guild_membership TO :dbc;


--
-- Name: my_guild_memberships; Type: VIEW
--

CREATE OR REPLACE VIEW public.my_guild_memberships AS
 SELECT guild_membership.guild_id,
    guild_membership.status,
    guild_membership.permissions,
    guild_membership.created_at,
    guild_membership.updated_at
   FROM public.guild_membership
  WHERE (guild_membership.member_id = public.current_member_id());

GRANT SELECT ON TABLE public.my_guild_memberships TO :dbm;
GRANT SELECT ON TABLE public.my_guild_memberships TO :dbc;


--
-- Name: guild_permissions(character varying); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.guild_permissions(guild character varying) RETURNS public.permission[]
AS $$
  SELECT permissions FROM guild_membership
    JOIN guilds ON guilds.id=guild_id
    WHERE guilds.slug = guild
    AND status = 'confirmed'
    AND member_id = current_member_id();
$$ LANGUAGE SQL STABLE;


--
-- Name: has_guild_permission(integer, public.permission); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.has_guild_permission(guildid integer, perm public.permission) RETURNS boolean
AS $$
  SELECT (SELECT count(*) FROM guild_membership
    JOIN members ON members.id=member_id
    WHERE guild_id = guildid
    AND status = 'confirmed'
    AND member_id = current_member_id()
    AND (coalesce(guild_membership.permissions, ARRAY[]::permission[]) && ARRAY[perm, 'guildAdmin'::permission]
      OR coalesce(members.permissions, ARRAY[]::permission[]) && ARRAY[perm, 'superadmin'::permission])
    ) > 0;
$$ LANGUAGE SQL STABLE;


--
-- Name: is_guild_id_leader(integer); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.is_guild_id_leader(guildid integer) RETURNS boolean
AS $$
  SELECT (SELECT count(*) FROM guild_membership
    WHERE guild_id = guildid
    AND status = 'confirmed'
    AND member_id = current_member_id()
    AND coalesce(guild_membership.permissions @> ARRAY['guildAdmin'::permission], false)
    ) > 0;
$$ LANGUAGE SQL STABLE;


--
-- Name: is_guild_id_member(integer); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.is_guild_id_member(guildid integer) RETURNS boolean
AS $$
  SELECT (SELECT count(*) FROM guild_membership
    WHERE guild_id = guildid
    AND status = 'confirmed'
    AND member_id = current_member_id()) > 0;
$$ LANGUAGE SQL STABLE;


--
-- Name: is_guild_member(character varying); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.is_guild_member(guild character varying) RETURNS boolean
AS $$
  SELECT (SELECT count(*) FROM guild_membership
    JOIN guilds ON guilds.id=guild_id
    WHERE guilds.slug = guild
    AND status = 'confirmed'
    AND member_id = current_member_id()) > 0;
$$ LANGUAGE SQL STABLE;


--
-- Name: after_delete_guild(); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.after_delete_guild() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE curuser varchar;
    BEGIN
      curuser := current_user;
      EXECUTE 'SET LOCAL ROLE ' || current_database() || '__owner';
      EXECUTE 'DROP ROLE ' || current_database() || '__g_' || OLD.id;
      EXECUTE 'DROP ROLE ' || current_database() || '__l_' || OLD.id;
      EXECUTE 'SET LOCAL ROLE ' || curuser;
      RETURN NEW;
    END;
    $$;

DROP TRIGGER IF EXISTS after_delete_guild ON public.guilds;
CREATE TRIGGER after_delete_guild AFTER DELETE ON public.guilds FOR EACH ROW EXECUTE FUNCTION public.after_delete_guild();


--
-- Name: after_delete_guild_membership(); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.after_delete_guild_membership() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE curuser varchar;
    DECLARE guild_id integer;
    DECLARE member_id integer;
    BEGIN
      SELECT id INTO member_id FROM members WHERE id=OLD.member_id;
      SELECT id INTO guild_id FROM guilds WHERE id=OLD.guild_id;
      IF member_id IS NOT NULL AND guild_id IS NOT NULL THEN
        curuser := current_user;
        EXECUTE 'SET LOCAL ROLE ' || current_database() || '__owner';
        EXECUTE 'ALTER GROUP ' || current_database() || '__g_' || OLD.guild_id || ' DROP USER ' || current_database() || '__m_' || OLD.member_id;
        EXECUTE 'ALTER GROUP ' || current_database() || '__l_' || OLD.guild_id || ' DROP USER ' || current_database() || '__m_' || OLD.member_id;
        EXECUTE 'SET LOCAL ROLE ' || curuser;
      END IF;
      RETURN OLD;
    END;
    $$;

DROP TRIGGER IF EXISTS after_delete_guild_membership ON public.guild_membership;
CREATE TRIGGER after_delete_guild_membership AFTER DELETE ON public.guild_membership FOR EACH ROW EXECUTE FUNCTION public.after_delete_guild_membership();



--
-- Name: alter_guild_membership(character varying, character varying, boolean, boolean); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.alter_guild_membership(guild integer, member integer, adding boolean, leader boolean) RETURNS void
    LANGUAGE plpgsql
    AS $$
    DECLARE curuser varchar;
    DECLARE default_role integer;
    BEGIN
      curuser := current_user;
      EXECUTE 'SET LOCAL ROLE ' || current_database() || '__owner';
      IF adding THEN
        -- TODO: check if member is already a member of group
        EXECUTE 'ALTER GROUP ' || current_database() || '__g_' || guild || ' ADD USER ' || current_database() || '__m_' || member;
        IF leader THEN
          EXECUTE 'ALTER GROUP ' || current_database() || '__l_' || guild || ' ADD USER ' || current_database() || '__m_' || member;
        ELSE
          EXECUTE 'ALTER GROUP ' || current_database() || '__l_' || guild || ' DROP USER ' || current_database() || '__m_' || member;
        END IF;
        IF NOT leader AND 0 = (SELECT count(*) from guild_member_available_role WHERE guild_id=guild AND member_id=member) THEN
          SELECT default_role_id INTO STRICT default_role FROM guilds WHERE id = guild;
          IF default_role IS NOT NULL THEN
            INSERT INTO guild_member_available_role (guild_id, member_id, role_id) VALUES (guild, member, default_role);
          END IF;
        END IF;
      ELSE
        EXECUTE 'ALTER GROUP ' || current_database() || '__g_' || guild || ' DROP USER ' || current_database() || '__m_' || member;
        EXECUTE 'ALTER GROUP ' || current_database() || '__l_' || guild || ' DROP USER ' || current_database() || '__m_' || member;
      END IF;
      EXECUTE 'SET LOCAL ROLE ' || curuser;
    END;
    $$;



--
-- Name: before_create_guild(); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.before_create_guild() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
      NEW.creator := current_member_id();
      RETURN NEW;
    END;
    $$;

DROP TRIGGER IF EXISTS before_create_guild ON public.guilds;
CREATE TRIGGER before_create_guild BEFORE INSERT ON public.guilds FOR EACH ROW EXECUTE FUNCTION public.before_create_guild();

--
-- Name: after_create_guild(); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.after_create_guild() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE curuser varchar;
    DECLARE guildrole varchar;
    DECLARE guildleadrole varchar;
    BEGIN
      guildrole := current_database() || '__g_' || NEW.id;
      guildleadrole := current_database() || '__l_' || NEW.id;
      curuser := current_user;
      EXECUTE 'SET LOCAL ROLE ' || current_database() || '__owner';
      EXECUTE 'CREATE ROLE ' || guildrole;
      EXECUTE 'CREATE ROLE ' || guildleadrole;
      EXECUTE 'ALTER GROUP ' || guildrole || ' ADD USER ' || current_database() || '__client';
      EXECUTE 'ALTER GROUP ' || guildleadrole || ' ADD USER ' || current_database() || '__client';
      EXECUTE 'SET LOCAL ROLE ' || curuser;
      INSERT INTO guild_membership (guild_id, member_id, status, permissions) VALUES (NEW.id, NEW.creator, 'confirmed', ARRAY['guildAdmin'::public.permission]);
      RETURN NEW;
    END;
    $$;

DROP TRIGGER IF EXISTS after_create_guild ON public.guilds;
CREATE TRIGGER after_create_guild AFTER INSERT ON public.guilds FOR EACH ROW EXECUTE FUNCTION public.after_create_guild();


--
-- Name: before_createup_guild_membership(); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.before_createup_guild_membership() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE is_requested boolean;
    DECLARE is_invited boolean;
    DECLARE needs_approval boolean;
    DECLARE open_for_app boolean;
    DECLARE guild_id integer;
    DECLARE member_id integer;
    BEGIN
        -- RAISE WARNING 'before_createup %', row_to_json(NEW);
        SELECT id, open_for_applications, application_needs_approval INTO STRICT guild_id, open_for_app, needs_approval FROM guilds WHERE id=NEW.guild_id;
        SELECT id INTO member_id FROM members WHERE id=NEW.member_id;
        is_requested := NOT (OLD IS NULL OR OLD.status = 'invitation');
        is_invited := NOT (OLD IS NULL OR OLD.status = 'request');
        IF (NOT needs_approval) OR is_guild_id_member(NEW.guild_id) OR 1 = (SELECT COUNT(id) FROM guilds WHERE id = NEW.guild_id AND creator=NEW.member_id) THEN
          is_invited := is_invited OR (NEW.status != 'request');
        END IF;
        IF NEW.member_id = current_member_id() THEN
          is_requested := is_requested OR (NEW.status != 'invitation');
        END IF;
        IF (NOT open_for_app) AND (NOT is_invited) THEN
          RETURN NULL;
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
        IF OLD IS NOT NULL AND NEW.permissions != OLD.permissions THEN
          IF NOT public.has_guild_permission(guild_id, 'guildAdmin') THEN
            RAISE EXCEPTION 'permission guildAdmin / change guild permissions';
          END IF;
          IF 'guildAdmin' = ANY(OLD.permissions) AND NOT ('guildAdmin' = ANY(NEW.permissions)) AND NOT is_superadmin() THEN
            IF NEW.member_id != current_member_id() THEN
              RAISE EXCEPTION 'permission guildAdmin / can remove another member''s guildAdmin permission';
            END IF;
            IF 1 = (SELECT COUNT(*) FROM guild_membership WHERE guild_id = NEW.guild_id AND permissions @> ARRAY['guildAdmin'::public.permission]) THEN
              RAISE EXCEPTION 'invalid permission / Cannot remove guildAdmin permission from the last guildAdmin member';
            END IF;
          END IF;
        END IF;
        NEW.updated_at := now();
        RETURN NEW;
    END;
$$;

DROP TRIGGER IF EXISTS before_update_guild_membership ON public.guild_membership;
CREATE TRIGGER before_update_guild_membership BEFORE UPDATE ON public.guild_membership FOR EACH ROW EXECUTE FUNCTION public.before_createup_guild_membership();

DROP TRIGGER IF EXISTS before_create_guild_membership ON public.guild_membership;
CREATE TRIGGER before_create_guild_membership BEFORE INSERT ON public.guild_membership FOR EACH ROW EXECUTE FUNCTION public.before_createup_guild_membership();



--
-- Name: after_createup_guild_membership(); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.after_createup_guild_membership() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
        IF (NEW.status = 'confirmed') != (OLD IS NOT NULL AND OLD.status = 'confirmed') AND NEW.member_id IS NOT NULL AND NEW.guild_id IS NOT NULL THEN
          PERFORM alter_guild_membership(NEW.guild_id, NEW.member_id, NEW.status = 'confirmed',
            coalesce(NEW.permissions @> ARRAY['guildAdmin'::permission], false));
        END IF;
        RETURN NEW;
    END;
$$;

DROP TRIGGER IF EXISTS after_update_guild_membership ON public.guild_membership;
CREATE TRIGGER after_update_guild_membership AFTER UPDATE ON public.guild_membership FOR EACH ROW EXECUTE FUNCTION public.after_createup_guild_membership();

DROP TRIGGER IF EXISTS after_create_guild_membership ON public.guild_membership;
CREATE TRIGGER after_create_guild_membership AFTER INSERT ON public.guild_membership FOR EACH ROW EXECUTE FUNCTION public.after_createup_guild_membership();


--
-- Name: before_update_guild(); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.before_update_guild() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
      NEW.updated_at := now();
      RETURN NEW;
    END;
    $$;

DROP TRIGGER IF EXISTS before_update_guild ON public.guilds;
CREATE TRIGGER before_update_guild BEFORE UPDATE ON public.guilds FOR EACH ROW EXECUTE FUNCTION public.before_update_guild();


--
-- Name: guilds; Type: ROW SECURITY
--

ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;

--
-- Name: guilds guilds_insert_policy; Type: POLICY
--

DROP POLICY IF EXISTS guilds_insert_policy ON public.guilds;
CREATE POLICY guilds_insert_policy ON public.guilds FOR INSERT WITH CHECK (public.has_permission('createGuild'));

--
-- Name: guilds guild_update_policy; Type: POLICY
--

DROP POLICY IF EXISTS guild_update_policy ON public.guilds;
CREATE POLICY guild_update_policy ON public.guilds FOR UPDATE USING (public.is_guild_id_member(id));

--
-- Name: guilds guilds_select_policy; Type: POLICY
--

DROP POLICY IF EXISTS guilds_select_policy ON public.guilds;
CREATE POLICY guilds_select_policy ON public.guilds FOR SELECT USING ((public OR (creator = public.current_member_id()) OR (id IN ( SELECT my_guild_memberships.guild_id
   FROM public.my_guild_memberships
  WHERE (my_guild_memberships.status = 'confirmed'::public.registration_status)))));


--
-- Name: guild_membership; Type: ROW SECURITY
--

ALTER TABLE public.guild_membership ENABLE ROW LEVEL SECURITY;

--
-- Name: guild_membership guild_membership_delete_policy; Type: POLICY
--

DROP POLICY IF EXISTS guild_membership_delete_policy ON public.guild_membership;
CREATE POLICY guild_membership_delete_policy ON public.guild_membership FOR DELETE USING (((public.current_member_id() = member_id) OR public.has_guild_permission(guild_id, 'revokeGuildMembership'::public.permission)));


--
-- Name: guild_membership guild_membership_insert_policy; Type: POLICY
--

DROP POLICY IF EXISTS guild_membership_insert_policy ON public.guild_membership;
CREATE POLICY guild_membership_insert_policy ON public.guild_membership FOR INSERT WITH CHECK (((public.current_member_id() = member_id) OR public.has_guild_permission(guild_id, 'proposeGuildMembership'::public.permission)));


--
-- Name: guild_membership guild_membership_select_policy; Type: POLICY
--

DROP POLICY IF EXISTS guild_membership_select_policy ON public.guild_membership;
CREATE POLICY guild_membership_select_policy ON public.guild_membership FOR SELECT USING (((member_id = public.current_member_id()) OR (( SELECT public_guilds.id
   FROM public.public_guilds
  WHERE (public_guilds.id = guild_membership.guild_id)) IS NOT NULL) OR (guild_id IN ( SELECT my_guild_memberships.guild_id
   FROM public.my_guild_memberships
  WHERE (my_guild_memberships.status = 'confirmed'::public.registration_status)))));


--
-- Name: guild_membership guild_membership_update_policy; Type: POLICY
--

DROP POLICY IF EXISTS guild_membership_update_policy ON public.guild_membership;
CREATE POLICY guild_membership_update_policy ON public.guild_membership FOR UPDATE USING ((member_id = public.current_member_id()) OR public.is_guild_id_member(guild_id));

DROP INDEX IF EXISTS public.guild_membership_member_id_idx;
CREATE INDEX guild_membership_member_id_idx ON guild_membership USING HASH (member_id);

DROP INDEX IF EXISTS public.guild_membership_guild_id_idx;
CREATE INDEX guild_membership_guild_id_idx ON guild_membership USING HASH (guild_id);

COMMIT;
