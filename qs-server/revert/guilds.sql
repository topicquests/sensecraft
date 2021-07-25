-- Revert sensecraft:guilds from pg

BEGIN;

-- delete to delete users
DELETE FROM guild_membership;
DELETE FROM guilds;
DROP POLICY IF EXISTS guilds_select_policy ON public.guilds;
DROP POLICY IF EXISTS guilds_insert_policy ON public.guilds;
DROP POLICY IF EXISTS guild_update_policy ON public.guilds;
DROP POLICY IF EXISTS guild_membership_update_policy ON public.guild_membership;
DROP POLICY IF EXISTS guild_membership_select_policy ON public.guild_membership;
DROP POLICY IF EXISTS guild_membership_insert_policy ON public.guild_membership;
DROP POLICY IF EXISTS guild_membership_delete_policy ON public.guild_membership;
ALTER TABLE IF EXISTS ONLY public.guilds DROP CONSTRAINT IF EXISTS guilds_creator_fkey;
ALTER TABLE IF EXISTS ONLY public.guild_membership DROP CONSTRAINT IF EXISTS guild_membership_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.guild_membership DROP CONSTRAINT IF EXISTS guild_membership_guild_id_fkey;
DROP TRIGGER IF EXISTS before_update_guild_membership ON public.guild_membership;
DROP TRIGGER IF EXISTS before_update_guild ON public.guilds;
DROP TRIGGER IF EXISTS before_create_guild_membership ON public.guild_membership;
DROP TRIGGER IF EXISTS before_create_guild ON public.guilds;
DROP TRIGGER IF EXISTS after_delete_guild_membership ON public.guild_membership;
DROP TRIGGER IF EXISTS after_delete_guild ON public.guilds;
DROP TRIGGER IF EXISTS after_create_guild ON public.guilds;
ALTER TABLE IF EXISTS ONLY public.guilds DROP CONSTRAINT IF EXISTS guilds_pkey;
ALTER TABLE IF EXISTS ONLY public.guilds DROP CONSTRAINT IF EXISTS guilds_handle_key;
ALTER TABLE IF EXISTS ONLY public.guild_membership DROP CONSTRAINT IF EXISTS guild_membership_pkey;
ALTER TABLE IF EXISTS public.guilds ALTER COLUMN id DROP DEFAULT;
DROP VIEW IF EXISTS public.public_guilds;
DROP VIEW IF EXISTS public.my_guild_memberships;
DROP SEQUENCE IF EXISTS public.guilds_id_seq;
DROP TABLE IF EXISTS public.guilds;
DROP TABLE IF EXISTS public.guild_membership;
DROP FUNCTION IF EXISTS  public.is_guild_member(guild character varying);
DROP FUNCTION IF EXISTS  public.is_guild_id_member(guildid integer);
DROP FUNCTION IF EXISTS  public.is_guild_id_leader(guildid integer);
DROP FUNCTION IF EXISTS  public.has_guild_permission(guildid integer, perm public.permission);
DROP FUNCTION IF EXISTS  public.guild_permissions(guild character varying);
DROP FUNCTION IF EXISTS  public.before_update_guild();
DROP FUNCTION IF EXISTS  public.before_createup_guild_membership();
DROP FUNCTION IF EXISTS  public.before_create_guild();
DROP FUNCTION IF EXISTS  public.alter_guild_membership(guild character varying, member character varying, adding boolean, leader boolean);
DROP FUNCTION IF EXISTS  public.after_delete_guild_membership();
DROP FUNCTION IF EXISTS  public.after_delete_guild();
DROP FUNCTION IF EXISTS  public.after_create_guild();

COMMIT;
