-- Deploy role_functions


BEGIN;
\set dbo :dbn '__owner';
\set dbm :dbn '__member';
\set dbc :dbn '__client';

DROP INDEX IF EXISTS public.guild_member_available_role_member_id_idx;
DROP INDEX IF EXISTS public.casting_role_member_id_idx;

REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE public.role FROM :dbm;
REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE public.role_node_constraint FROM :dbm;
REVOKE SELECT ON TABLE public.role FROM :dbc;
REVOKE SELECT ON TABLE public.role_node_constraint FROM :dbc;
REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE public.casting_role FROM :dbm;
REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE public.guild_member_available_role FROM :dbm;

DROP POLICY IF EXISTS role_node_constraint_insert_policy ON public.role_node_constraint;
DROP POLICY IF EXISTS role_node_constraint_delete_policy ON public.role_node_constraint;
DROP POLICY IF EXISTS role_node_constraint_update_policy ON public.role_node_constraint;
DROP POLICY IF EXISTS role_node_constraint_select_policy ON public.role_node_constraint;

REVOKE USAGE ON SEQUENCE public.role_id_seq FROM :dbm;
DROP POLICY IF EXISTS role_insert_policy ON public.role;
DROP POLICY IF EXISTS role_delete_policy ON public.role;
DROP POLICY IF EXISTS role_update_policy ON public.role;
DROP POLICY IF EXISTS role_select_policy ON public.role;
ALTER TABLE public.role DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS casting_role_insert_policy ON public.casting_role;
DROP POLICY IF EXISTS casting_role_delete_policy ON public.casting_role;
DROP POLICY IF EXISTS casting_role_update_policy ON public.casting_role;
DROP POLICY IF EXISTS casting_role_select_policy ON public.casting_role;
ALTER TABLE public.casting_role DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS guild_member_available_role_insert_policy on public.guild_member_available_role;
DROP POLICY IF EXISTS guild_member_available_role_delete_policy on public.guild_member_available_role;
DROP POLICY IF EXISTS guild_member_available_role_update_policy on public.guild_member_available_role;
DROP POLICY IF EXISTS guild_member_available_role_select_policy on public.guild_member_available_role;
ALTER TABLE public.guild_member_available_role DISABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS before_update_role ON public.role;
DROP FUNCTION IF EXISTS before_update_role();

DROP FUNCTION IF EXISTS public.has_game_permission(quest_id integer, perm public.permission);
DROP FUNCTION IF EXISTS public.is_visible_role(guild_id integer);
DROP FUNCTION IF EXISTS public.is_editable_role(guild_id integer);
DROP FUNCTION IF EXISTS public.is_guild_role(guild_id integer, role_id integer);

COMMIT;
