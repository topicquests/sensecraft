-- Revert sensecraft:quests_functions from pg

BEGIN;

\set dbm :dbn '__member';
\set dbc :dbn '__client';

DROP INDEX IF EXISTS public.quest_membership_member_id_idx;
DROP INDEX IF EXISTS public.quest_membership_quest_id_idx;

REVOKE SELECT,INSERT,UPDATE, DELETE ON TABLE public.quests FROM :dbm;
REVOKE SELECT ON TABLE public.quests FROM :dbc;
REVOKE USAGE ON SEQUENCE public.quests_id_seq FROM :dbm;
REVOKE SELECT ON TABLE public.public_quests FROM :dbm;
REVOKE SELECT ON TABLE public.public_quests FROM :dbc;
REVOKE SELECT,INSERT,UPDATE ON TABLE public.quest_membership FROM :dbm;
REVOKE SELECT ON TABLE public.quest_membership FROM :dbc;

DROP POLICY IF EXISTS quests_delete_policy ON public.quests;
DROP POLICY IF EXISTS quests_select_policy ON public.quests;
DROP POLICY IF EXISTS quests_insert_policy ON public.quests;
DROP POLICY IF EXISTS quest_update_policy ON public.quests;
ALTER TABLE public.quests DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS quest_membership_delete_policy ON public.quest_membership;
DROP POLICY IF EXISTS quest_membership_insert_policy ON public.quest_membership;
DROP POLICY IF EXISTS quest_membership_update_policy ON public.quest_membership;
DROP POLICY IF EXISTS quest_membership_select_policy ON public.quest_membership;
ALTER TABLE public.quest_membership DISABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS before_update_quest_membership ON public.quest_membership;
DROP TRIGGER IF EXISTS before_update_quest ON public.quests;
DROP TRIGGER IF EXISTS before_delete_quest ON public.quests;
DROP TRIGGER IF EXISTS before_create_quest_membership ON public.quest_membership;
DROP TRIGGER IF EXISTS before_create_quest ON public.quests;
DROP TRIGGER IF EXISTS after_delete_quest_membership ON public.quest_membership;
DROP TRIGGER IF EXISTS after_delete_quest ON public.quests;
DROP TRIGGER IF EXISTS after_create_quest ON public.quests;
DROP VIEW IF EXISTS public.my_quest_memberships;
DROP FUNCTION IF EXISTS  public.has_quest_permission(questid integer, perm public.permission);
DROP FUNCTION IF EXISTS  public.is_quest_member(quest character varying);
DROP FUNCTION IF EXISTS  public.is_quest_id_member(questid integer);
DROP FUNCTION IF EXISTS  public.before_update_quest();
DROP FUNCTION IF EXISTS  public.before_createup_quest_membership();
DROP FUNCTION IF EXISTS  public.before_create_quest();
DROP FUNCTION IF EXISTS  public.alter_quest_membership(quest character varying, member character varying, adding boolean);
DROP FUNCTION IF EXISTS  public.after_delete_quest_membership();
DROP FUNCTION IF EXISTS  public.after_delete_quest();
DROP FUNCTION IF EXISTS  public.before_delete_quest();
DROP FUNCTION IF EXISTS  public.after_create_quest();

COMMIT;
