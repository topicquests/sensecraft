-- Deploy role


BEGIN;

ALTER TABLE public.guild_member_available_role ADD CONSTRAINT guild_member_available_role_members_fkey FOREIGN KEY (member_id)
      REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.guild_member_available_role ADD CONSTRAINT guild_member_available_role_guilds_fkey FOREIGN KEY (guild_id)
      REFERENCES public.guilds(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.casting_role ADD CONSTRAINT casting_role_members_fkey FOREIGN KEY (member_id)
      REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.casting_role ADD CONSTRAINT casting_role_quests_fkey FOREIGN KEY (quest_id)
      REFERENCES public.quests(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.casting_role ADD CONSTRAINT casting_role_guilds_fkey FOREIGN KEY (guild_id)
      REFERENCES public.guilds(id) ON UPDATE CASCADE ON DELETE CASCADE;

COMMIT;
