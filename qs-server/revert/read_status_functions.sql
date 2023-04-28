-- Revert sensecraft:read_status_functions from pg

BEGIN;

\set dbo :dbn '__owner';
\set dbm :dbn '__member';
\set dbc :dbn '__client';

DROP FUNCTION IF EXISTS  public.unread_status_list();

REVOKE SELECT,INSERT,DELETE,UPDATE ON TABLE public.read_status FROM :dbm;
REVOKE SELECT ON TABLE public.read_status FROM :dbc;




COMMIT;
