-- Deploy role_functions
-- requires: role
-- requires: guilds_functions
-- idempotent

BEGIN;
\set dbo :dbn '__owner';
\set dbm :dbn '__member';
\set dbc :dbn '__client';


--
-- Name: TABLE role; Type: ACL
--

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.role TO :dbm;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.casting_role TO :dbm;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.guild_member_available_role TO :dbm;

--
-- Name: SEQUENCE members_id_seq; Type: ACL
--

GRANT USAGE ON SEQUENCE public.members_id_seq TO :dbc;

--
-- Name: role; Type: ROW SECURITY
--

ALTER TABLE public.role ENABLE ROW LEVEL SECURITY;

--
-- Name: role role_insert_policy; Type: POLICY
--

DROP POLICY IF EXISTS role_insert_policy ON public.role;
CREATE POLICY role_insert_policy ON public.role FOR INSERT WITH CHECK (
    (guild_id is NULL AND public.has_permission('superadmin')) OR
    (guild_id IS NOT NULL AND public.has_guild_permission(guild_id, 'guildAdmin')));

--
-- Name: role role_delete_policy; Type: POLICY
--

DROP POLICY IF EXISTS role_delete_policy ON public.role;
CREATE POLICY role_delete_policy ON public.role FOR DELETE USING (
    (guild_id is NULL AND public.has_permission('superadmin')) OR
    (guild_id IS NOT NULL AND public.has_guild_permission(guild_id, 'guildAdmin')));

    --
-- Name: role role_update_policy; Type: POLICY
--

DROP POLICY IF EXISTS role_update_policy ON public.role;
CREATE POLICY role_update_policy ON public.role FOR UPDATE USING (
    (guild_id is NULL AND public.has_permission('superadmin')) OR
    (guild_id IS NOT NULL AND public.has_guild_permission(guild_id, 'guildAdmin')));

--
-- Name: role role_select_policy; Type: POLICY
--

DROP POLICY IF EXISTS role_select_policy ON public.role;
CREATE POLICY role_select_policy ON public.role FOR SELECT USING (true);

--
-- Name: guild_member_available_role; Type: ROW SECURITY
--

ALTER TABLE public.guild_member_available_role ENABLE ROW LEVEL SECURITY;

--
-- Name: guild_member_available_role guild_member_available_role_insert_policy; Type: POLICY
--

DROP POLICY IF EXISTS guild_member_available_role_insert_policy ON public.guild_member_available_role;
CREATE POLICY guild_member_available_role_insert_policy ON public.guild_member_available_role FOR INSERT WITH CHECK (
(public.has_guild_permission(guild_id, 'guildAdmin')));

--
-- Name: guild_member_available_role guild_member_available_role_delete_policy; Type: POLICY
--

DROP POLICY IF EXISTS guild_member_available_role_delete_policy ON public.guild_member_available_role;
CREATE POLICY guild_member_available_role_delete_policy ON public.guild_member_available_role FOR DELETE USING (
(public.has_guild_permission(guild_id, 'guildAdmin')));

--
-- Name: guild_member_available_role guild_member_available_role_select_policy; Type: POLICY
--

DROP POLICY IF EXISTS guild_member_available_role_select_policy ON public.guild_member_available_role;
CREATE POLICY guild_member_available_role_select_policy ON public.guild_member_available_role FOR SELECT USING (
(public.is_guild_id_member(guild_id)));

--
-- Name: guild_member_available_role guild_member_available_role_update_policy; Type: POLICY
--

DROP POLICY IF EXISTS guild_member_available_role_update_policy ON public.guild_member_available_role;
CREATE POLICY guild_member_available_role_update_policy ON public.guild_member_available_role FOR UPDATE USING (
(public.has_guild_permission(guild_id, 'guildAdmin')));

--
-- Name: casting_role; Type: ROW SECURITY
--

ALTER TABLE public.casting_role ENABLE ROW LEVEL SECURITY;

--
-- Name: casting_role casting_role_insert_policy; Type: POLICY
--

DROP POLICY IF EXISTS casting_role_insert_policy ON public.casting_role;
CREATE POLICY casting_role_insert_policy ON public.casting_role FOR INSERT WITH CHECK (
   ((public.current_member_id() = member_id) AND (public.is_guild_id_member(guild_id))));

--
-- Name: casting_role casting_role_delete_policy; Type: POLICY
--

DROP POLICY IF EXISTS casting_role_delete_policy ON public.casting_role;
CREATE POLICY casting_role_delete_policy ON public.casting_role FOR DELETE USING(
    ((public.current_member_id() = member_id) AND (public.is_guild_id_member(guild_id))));

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
((public.current_member_id() = member_id) AND (public.is_guild_id_member(guild_id))));

COMMIT;
