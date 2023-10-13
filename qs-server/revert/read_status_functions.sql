-- Revert sensecraft:read_status_functions from pg

BEGIN;

\set dbo :dbn '__owner';
\set dbm :dbn '__member';
\set dbc :dbn '__client';

DROP FUNCTION IF EXISTS public.unread_status_list();
DROP FUNCTION IF EXISTS public.unread_status_list(integer);
DROP FUNCTION IF EXISTS public.node_shown_time(node_id integer, seconds float);
DROP FUNCTION IF EXISTS public.node_set_read_status(node_id integer, new_status boolean, override boolean);

DROP TRIGGER IF EXISTS after_update_node_clear_read_status ON public.conversation_node;
DROP FUNCTION IF EXISTS public.reset_read_status();

DROP POLICY IF EXISTS read_status_update_policy ON public.read_status;
DROP POLICY IF EXISTS read_status_insert_policy ON public.read_status;
DROP POLICY IF EXISTS read_status_select_policy ON public.read_status;
DROP POLICY IF EXISTS read_status_delete_policy ON public.read_status;


-- REVOKE SELECT,INSERT,DELETE,UPDATE ON TABLE public.read_status FROM :dbm;
-- REVOKE SELECT ON TABLE public.read_status FROM :dbc;

COMMIT;
