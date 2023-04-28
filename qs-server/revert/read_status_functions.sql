-- Revert sensecraft:read_status_functions from pg

BEGIN;

\set dbo :dbn '__owner';
\set dbm :dbn '__member';
\set dbc :dbn '__client';

DROP FUNCTION IF EXISTS  public.unread_status_list();
DROP FUNCTION IF EXISTS node_shown_time(node_id integer, seconds float);
DROP FUNCTION IF EXISTS node_set_read_status(node_id integer, new_status boolean, override boolean);

-- REVOKE SELECT,INSERT,DELETE,UPDATE ON TABLE public.read_status FROM :dbm;
-- REVOKE SELECT ON TABLE public.read_status FROM :dbc;

COMMIT;
