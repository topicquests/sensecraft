-- Revert sensecraft:casting_functions from pg

BEGIN;

\set dbo :dbn '__owner';
\set dbm :dbn '__member';
\set dbc :dbn '__client';

REVOKE SELECT,INSERT,DELETE,UPDATE ON TABLE public.casting FROM :dbm;
REVOKE SELECT ON TABLE public.casting FROM :dbc;

DROP POLICY IF EXISTS casting_update_policy ON public.casting;
DROP POLICY IF EXISTS casting_select_policy ON public.casting;
DROP POLICY IF EXISTS casting_insert_policy ON public.casting;
DROP POLICY IF EXISTS casting_delete_policy ON public.casting;
ALTER TABLE public.casting DISABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS before_update_casting ON public.casting;
DROP FUNCTION IF EXISTS before_update_casting();

DROP FUNCTION IF EXISTS public.register_all_members(questid INTEGER, guildid INTEGER);

COMMIT;
