-- Revert sensecraft:members_functions from pg

BEGIN;

\set dbm :dbn '__member';
\set dbc :dbn '__client';

REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE public.members FROM :dbm;
REVOKE SELECT,INSERT ON TABLE public.members FROM :dbc;
REVOKE USAGE ON SEQUENCE public.members_id_seq FROM :dbc;

DROP POLICY IF EXISTS members_update_policy ON public.members;
DROP POLICY IF EXISTS members_delete_policy ON public.members;
DROP POLICY IF EXISTS members_select_policy ON public.members;
DROP POLICY IF EXISTS members_insert_policy ON public.members;
ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS before_update_member ON public.members;
DROP FUNCTION IF EXISTS  public.before_update_member();
DROP TRIGGER IF EXISTS after_delete_member ON public.members;
DROP FUNCTION IF EXISTS  public.after_delete_member();
DROP TRIGGER IF EXISTS before_create_member ON public.members;
DROP FUNCTION IF EXISTS  public.before_create_member();

DROP FUNCTION IF EXISTS  public.get_token(mail character varying, pass character varying);
DROP FUNCTION IF EXISTS  public.renew_token(token character varying);
DROP FUNCTION IF EXISTS  public.scmember_handle();
DROP FUNCTION IF EXISTS  public.role_to_handle(role character varying);
DROP FUNCTION IF EXISTS  public.has_permission(permission character varying);
DROP FUNCTION IF EXISTS  public.current_member_id();
DROP FUNCTION IF EXISTS  public.create_member(name character varying, email character varying, password character varying, handle character varying, permissions permission[]);

COMMIT;
