-- Deploy role_functions
-- requires: casting_role
-- requires: guilds_functions
-- requires: quests_functions
-- requires: casting
-- idempotent

BEGIN;
\set dbo :dbn '__owner';
\set dbm :dbn '__member';
\set dbc :dbn '__client';


--
-- Name: TABLE role; Type: ACL
--

GRANT SELECT ON TABLE public.role TO :dbc;
GRANT SELECT ON TABLE public.role_node_constraint TO :dbc;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.role TO :dbm;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.role_node_constraint TO :dbm;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.casting_role TO :dbm;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.guild_member_available_role TO :dbm;

--
-- Name: SEQUENCE role_id_seq; Type: ACL
--

GRANT USAGE ON SEQUENCE public.role_id_seq TO :dbm;

--
-- Name: before_update_role(); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.before_update_role() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
      IF NEW.guild_id IS NULL AND NOT public.has_permission('superadmin') THEN
        RAISE EXCEPTION 'Only superadmin can alter system roles';
      END IF;
      IF NEW.guild_id IS NOT NULL AND OLD.guild_id IS NULL THEN
        RAISE EXCEPTION 'Cannot change a system role into a guild role';
      END IF;
      IF NEW.guild_id IS NOT NULL AND NOT public.has_guild_permission('guild_admin', NEW.guild_id) THEN
        RAISE EXCEPTION 'Only guild admins can alter guild roles';
      END IF;
      IF OLD.guild_id != NEW.guild_id THEN
        RAISE EXCEPTION 'You cannot change the guild of a role';
      END IF;
      RETURN NEW;
    END;
    $$;

DROP TRIGGER IF EXISTS before_update_role ON public.role;
CREATE TRIGGER before_update_role BEFORE UPDATE ON public.role FOR EACH ROW EXECUTE FUNCTION public.before_update_role();

--
-- Name: is_guild_role(integer, integer); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.is_guild_role(guild_id integer, role_id integer) RETURNS boolean AS $$
    SELECT COALESCE(r.guild_id, guild_id) = guild_id FROM public.role r
        WHERE r.id = role_id;
$$ LANGUAGE sql STABLE;

--
-- Name: is_visible_role(integer); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.is_visible_role(guild_id integer) RETURNS boolean AS $$
    SELECT guild_id IS NULL OR 
           public.has_permission('superadmin') OR
           public.is_guild_id_member(guild_id);
$$ LANGUAGE sql STABLE;

--
-- Name: is_editable_role(integer); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.is_editable_role(guild_id integer) RETURNS boolean AS $$
    SELECT (guild_id is NULL AND public.has_permission('superadmin')) OR
    (guild_id IS NOT NULL AND public.has_guild_permission(guild_id, 'guildAdmin'));
$$ LANGUAGE sql STABLE;


--
-- Name: role; Type: ROW SECURITY
--

ALTER TABLE public.role ENABLE ROW LEVEL SECURITY;

--
-- Name: role role_insert_policy; Type: POLICY
--

DROP POLICY IF EXISTS role_insert_policy ON public.role;
CREATE POLICY role_insert_policy ON public.role FOR INSERT WITH CHECK (is_editable_role(guild_id));

--
-- Name: role role_delete_policy; Type: POLICY
--

DROP POLICY IF EXISTS role_delete_policy ON public.role;
CREATE POLICY role_delete_policy ON public.role FOR DELETE USING (is_editable_role(guild_id));

    --
-- Name: role role_update_policy; Type: POLICY
--

DROP POLICY IF EXISTS role_update_policy ON public.role;
CREATE POLICY role_update_policy ON public.role FOR UPDATE USING (is_editable_role(guild_id));

--
-- Name: role role_select_policy; Type: POLICY
--

DROP POLICY IF EXISTS role_select_policy ON public.role;
CREATE POLICY role_select_policy ON public.role FOR SELECT USING (is_visible_role(guild_id));


--
-- Name: role; Type: ROW SECURITY
--

ALTER TABLE public.role_node_constraint ENABLE ROW LEVEL SECURITY;

--
-- Name: role role_insert_policy; Type: POLICY
--

DROP POLICY IF EXISTS role_node_constraint_insert_policy ON public.role_node_constraint;
CREATE POLICY role_node_constraint_insert_policy ON public.role_node_constraint FOR INSERT WITH CHECK (
   is_editable_role((SELECT guild_id FROM public.role WHERE id=role_id LIMIT 1)));

--
-- Name: role role_delete_policy; Type: POLICY
--

DROP POLICY IF EXISTS role_node_constraint_delete_policy ON public.role_node_constraint;
CREATE POLICY role_node_constraint_delete_policy ON public.role_node_constraint FOR DELETE USING (
   is_editable_role((SELECT guild_id FROM public.role WHERE id=role_id LIMIT 1)));

    --
-- Name: role role_update_policy; Type: POLICY
--

DROP POLICY IF EXISTS role_node_constraint_update_policy ON public.role_node_constraint;
CREATE POLICY role_node_constraint_update_policy ON public.role_node_constraint FOR UPDATE USING (
   is_editable_role((SELECT guild_id FROM public.role WHERE id=role_id LIMIT 1)));

--
-- Name: role role_select_policy; Type: POLICY
--

DROP POLICY IF EXISTS role_node_constraint_select_policy ON public.role_node_constraint;
CREATE POLICY role_node_constraint_select_policy ON public.role_node_constraint FOR SELECT USING (
   is_visible_role((SELECT guild_id FROM public.role WHERE id=role_id LIMIT 1)));


--
-- Name: guild_member_available_role; Type: ROW SECURITY
--

ALTER TABLE public.guild_member_available_role ENABLE ROW LEVEL SECURITY;

--
-- Name: guild_member_available_role guild_member_available_role_insert_policy; Type: POLICY
--

DROP POLICY IF EXISTS guild_member_available_role_insert_policy ON public.guild_member_available_role;
CREATE POLICY guild_member_available_role_insert_policy ON public.guild_member_available_role FOR INSERT WITH CHECK (
    public.has_guild_permission(guild_id, 'guildAdmin'));
--
-- Name: guild_member_available_role guild_member_available_role_delete_policy; Type: POLICY
--

DROP POLICY IF EXISTS guild_member_available_role_delete_policy ON public.guild_member_available_role;
CREATE POLICY guild_member_available_role_delete_policy ON public.guild_member_available_role FOR DELETE USING (
    public.has_guild_permission(guild_id, 'guildAdmin'));

--
-- Name: guild_member_available_role guild_member_available_role_select_policy; Type: POLICY
--

DROP POLICY IF EXISTS guild_member_available_role_select_policy ON public.guild_member_available_role;
CREATE POLICY guild_member_available_role_select_policy ON public.guild_member_available_role FOR SELECT USING (
    public.is_guild_id_member(guild_id));

--
-- Name: guild_member_available_role guild_member_available_role_update_policy; Type: POLICY
--

DROP POLICY IF EXISTS guild_member_available_role_update_policy ON public.guild_member_available_role;
CREATE POLICY guild_member_available_role_update_policy ON public.guild_member_available_role FOR UPDATE USING (
    public.has_guild_permission(guild_id, 'guildAdmin'));


GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.casting_role TO :dbm;
GRANT SELECT ON TABLE public.casting_role TO :dbc;

--
-- Name: casting_role; Type: ROW SECURITY
--

ALTER TABLE public.casting_role ENABLE ROW LEVEL SECURITY;

--
-- Name: casting_role casting_role_insert_policy; Type: POLICY
--

DROP POLICY IF EXISTS casting_role_insert_policy ON public.casting_role;
CREATE POLICY casting_role_insert_policy ON public.casting_role FOR INSERT WITH CHECK (
   public.current_member_id() = member_id);

--
-- Name: casting_role casting_role_delete_policy; Type: POLICY
--

DROP POLICY IF EXISTS casting_role_delete_policy ON public.casting_role;
CREATE POLICY casting_role_delete_policy ON public.casting_role FOR DELETE USING(
    public.current_member_id() = member_id);

--
-- Name: casting_role casting_role_select_policy; Type: POLICY
--

DROP POLICY IF EXISTS casting_role_select_policy ON public.casting_role;
CREATE POLICY casting_role_select_policy ON public.casting_role FOR SELECT USING (true);

--
-- Name: casting_role casting_role_update_policy; Type: POLICY
--

DROP POLICY IF EXISTS casting_role_update_policy ON public.casting_role;
CREATE POLICY casting_role_update_policy ON public.casting_role FOR UPDATE USING (
    public.current_member_id() = member_id);

--
-- Name: has_game_permission(integer, public.permission); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.has_game_permission(quest_id integer, perm public.permission) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
    DECLARE guild_id integer;
    DECLARE casting_permissions public.permission[];
    BEGIN
      -- do we care about quest permissions?
      IF public.has_quest_permission(quest_id, perm) THEN
        RETURN TRUE;
      END IF;
      SELECT guild_id, permissions INTO STRICT guild_id, casting_permissions FROM public.casting WHERE quest_id = quest_id AND member_id == current_member_id();
      IF guild_id IS NULL THEN
        RETURN FALSE;
      END IF;
      IF casting_permissions && perm THEN
        RETURN TRUE;
      END IF;
      IF public.has_guild_permission(guild_id, perm) THEN
        RETURN TRUE;
      END IF;
      RETURN (SELECT count(*) FROM public.role_casting
        JOIN public.role ON 
          role_casting.role_id = role.id
        WHERE
          role_casting.member_id = current_member_id() AND
          role_casting.quest_id = quest_id AND
          role_casting.guild_id = guild_id AND
          role.permissions && perm) > 0;
      END;
      $$;

DROP INDEX IF EXISTS public.guild_member_available_role_member_id_idx;
CREATE INDEX guild_member_available_role_member_id_idx ON guild_member_available_role USING HASH (member_id);

DROP INDEX IF EXISTS public.casting_role_member_id_idx;
CREATE INDEX casting_role_member_id_idx ON casting_role USING HASH (member_id);

COMMIT;
