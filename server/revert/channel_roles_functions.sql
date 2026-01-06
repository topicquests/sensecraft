-- Deploy channel_roles_functions
BEGIN;

\set dbo :dbn '__owner';
\set dbm :dbn '__member';
\set dbc :dbn '__client';

REVOKE SELECT,INSERT,DELETE,UPDATE ON TABLE public.channel_roles FROM :dbm;
REVOKE SELECT ON TABLE public.channel_roles FROM :dbc;
REVOKE USAGE ON SEQUENCE public.channel_roles_id_seq FROM :dbm;

-- Drop dependent functions first
DROP FUNCTION IF EXISTS public.channel_roles_in_guild(integer);

DROP TRIGGER IF EXISTS after_insert_channel_role ON public.channel_roles;
DROP FUNCTION IF EXISTS public.after_insert_channel_role();

DROP FUNCTION IF EXISTS public.populate_channel_roles(data JSONB);
DROP FUNCTION IF EXISTS public.has_channel_role(id INTEGER, member_id INTEGER, role_id INTEGER);
DROP FUNCTION IF EXISTS public.guild_channel_roles(guild_id INTEGER);

DROP POLICY IF EXISTS channel_roles_select_policy ON public.channel_roles;
DROP POLICY IF EXISTS channel_roles_insert_policy ON public.channel_roles;
ALTER TABLE public.channel_roles DISABLE ROW LEVEL SECURITY;

DROP INDEX IF EXISTS channel_roles_guild_id_idx;
DROP INDEX IF EXISTS channel_roles_channel_id_idx;

COMMIT;
