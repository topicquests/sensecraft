-- Deploy role_functions


BEGIN;
\set dbo :dbn '__owner';
\set dbm :dbn '__member';
\set dbc :dbn '__client';

REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE public.role FROM :dbm;
REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE public.casting_role FROM :dbm;
REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE public.guild_member_available_role FROM :dbm;
DROP POLICY IF EXISTS role_insert_policy ON public.role;
DROP POLICY IF EXISTS role_delete_policy ON public.role;
DROP POLICY IF EXISTS role_update_policy ON public.role;
DROP POLICY IF EXISTS role_select_policy ON public.role;
ALTER TABLE public.role DISABLE ROW LEVEL SECURITY;

COMMIT;
