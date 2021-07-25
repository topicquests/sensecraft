-- Revert sensecraft:quests from pg

BEGIN;

-- delete to delete users
DELETE FROM quest_membership;
DELETE FROM quests;

DROP POLICY IF EXISTS quests_delete_policy ON public.quests;
DROP POLICY IF EXISTS quests_select_policy ON public.quests;
DROP POLICY IF EXISTS quests_insert_policy ON public.quests;
DROP POLICY IF EXISTS quest_update_policy ON public.quests;
DROP POLICY IF EXISTS quest_membership_delete_policy ON public.quest_membership;
DROP POLICY IF EXISTS quest_membership_update_policy ON public.quest_membership;
DROP POLICY IF EXISTS quest_membership_select_policy ON public.quest_membership;
ALTER TABLE IF EXISTS ONLY public.quests DROP CONSTRAINT IF EXISTS quests_creator_fkey;
ALTER TABLE IF EXISTS ONLY public.quest_membership DROP CONSTRAINT IF EXISTS quest_membership_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.quest_membership DROP CONSTRAINT IF EXISTS quest_membership_quest_id_fkey;
DROP TRIGGER IF EXISTS before_update_quest_membership ON public.quest_membership;
DROP TRIGGER IF EXISTS before_update_quest ON public.quests;
DROP TRIGGER IF EXISTS before_create_quest_membership ON public.quest_membership;
DROP TRIGGER IF EXISTS before_create_quest ON public.quests;
DROP TRIGGER IF EXISTS after_delete_quest_membership ON public.quest_membership;
DROP TRIGGER IF EXISTS after_delete_quest ON public.quests;
DROP TRIGGER IF EXISTS after_create_quest ON public.quests;
ALTER TABLE IF EXISTS ONLY public.quests DROP CONSTRAINT IF EXISTS quests_pkey;
ALTER TABLE IF EXISTS ONLY public.quests DROP CONSTRAINT IF EXISTS quests_handle_key;
ALTER TABLE IF EXISTS ONLY public.quest_membership DROP CONSTRAINT IF EXISTS quest_membership_pkey;
ALTER TABLE IF EXISTS public.quests ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.quests_id_seq;
DROP VIEW IF EXISTS public.public_quests;
DROP TABLE IF EXISTS public.quests;
DROP VIEW IF EXISTS public.my_quest_memberships;
DROP TABLE IF EXISTS public.quest_membership;
DROP FUNCTION IF EXISTS  public.has_quest_permission(questid integer, perm public.permission);
DROP FUNCTION IF EXISTS  public.is_quest_member(quest character varying);
DROP FUNCTION IF EXISTS  public.is_quest_id_member(questid integer);
DROP FUNCTION IF EXISTS  public.before_update_quest();
DROP FUNCTION IF EXISTS  public.before_createup_quest_membership();
DROP FUNCTION IF EXISTS  public.before_create_quest();
DROP FUNCTION IF EXISTS  public.alter_quest_membership(quest character varying, member character varying, adding boolean);
DROP FUNCTION IF EXISTS  public.after_delete_quest_membership();
DROP FUNCTION IF EXISTS  public.after_delete_quest();
DROP FUNCTION IF EXISTS  public.after_create_quest();

COMMIT;
