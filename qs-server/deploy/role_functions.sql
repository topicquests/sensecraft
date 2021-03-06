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
      IF NEW.guild_id IS NULL AND NOT public.has_permission('createSystemRole') THEN
        RAISE EXCEPTION 'permission createSystemRole';
      END IF;
      IF OLD.guild_id != NEW.guild_id THEN
        IF NEW.guild_id IS NOT NULL AND OLD.guild_id IS NULL THEN
            RAISE EXCEPTION 'immutable guild_id / Cannot change a system role into a guild role';
        ELSE
            RAISE EXCEPTION 'immutable guild_id';
        END IF;
      END IF;
      IF NEW.guild_id IS NOT NULL AND NOT public.has_guild_permission(NEW.guild_id, 'createGuildRole') THEN
        RAISE EXCEPTION 'permission createGuildRole';
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
-- Name: is_editable_role(integer); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.is_editable_role(guild_id integer) RETURNS boolean AS $$
    SELECT (guild_id IS NULL AND public.has_permission('createSystemRole')) OR
    (guild_id IS NOT NULL AND public.has_guild_permission(guild_id, 'createGuildRole'));
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
CREATE POLICY role_select_policy ON public.role FOR SELECT USING (true);

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
CREATE POLICY role_node_constraint_select_policy ON public.role_node_constraint FOR SELECT USING (true);


--
-- Name: guild_member_available_role; Type: ROW SECURITY
--

ALTER TABLE public.guild_member_available_role ENABLE ROW LEVEL SECURITY;

--
-- Name: guild_member_available_role guild_member_available_role_insert_policy; Type: POLICY
--

DROP POLICY IF EXISTS guild_member_available_role_insert_policy ON public.guild_member_available_role;
CREATE POLICY guild_member_available_role_insert_policy ON public.guild_member_available_role FOR INSERT WITH CHECK (
    public.has_guild_permission(guild_id, 'addAvailableRole'));
--
-- Name: guild_member_available_role guild_member_available_role_delete_policy; Type: POLICY
--

DROP POLICY IF EXISTS guild_member_available_role_delete_policy ON public.guild_member_available_role;
CREATE POLICY guild_member_available_role_delete_policy ON public.guild_member_available_role FOR DELETE USING (
    public.has_guild_permission(guild_id, 'addAvailableRole'));

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
    public.has_guild_permission(guild_id, 'addAvailableRole'));


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
   public.current_member_id() = member_id OR public.has_guild_permission(guild_id, 'setPlayerRole'));

--
-- Name: casting_role casting_role_delete_policy; Type: POLICY
--

DROP POLICY IF EXISTS casting_role_delete_policy ON public.casting_role;
CREATE POLICY casting_role_delete_policy ON public.casting_role FOR DELETE USING(
    public.current_member_id() = member_id OR public.has_guild_permission(guild_id, 'setPlayerRole'));

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
    public.current_member_id() = member_id OR public.has_guild_permission(guild_id, 'setPlayerRole'));

--
-- Name: has_game_permission(integer, public.permission); Type: FUNCTION
--

DROP FUNCTION IF EXISTS public.has_game_permission(quest_id integer, perm public.permission);

DROP INDEX IF EXISTS public.guild_member_available_role_member_id_idx;
CREATE INDEX guild_member_available_role_member_id_idx ON guild_member_available_role USING HASH (member_id);

DROP INDEX IF EXISTS public.casting_role_member_id_idx;
CREATE INDEX casting_role_member_id_idx ON casting_role USING HASH (member_id);

--
-- Name: is_visible_role(integer); Type: FUNCTION
--

DROP FUNCTION IF EXISTS public.is_visible_role(guild_id integer);

COMMIT;
