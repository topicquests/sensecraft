-- Deploy casting_role


BEGIN;

ALTER TABLE public.casting_role DROP CONSTRAINT casting_role_available_role_fkey;
ALTER TABLE public.casting_role ADD  CONSTRAINT casting_role_available_role_fkey
  FOREIGN KEY (guild_id, member_id, role_id)
      REFERENCES public.guild_member_available_role(guild_id, member_id, role_id)
      ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE public.casting_role DROP CONSTRAINT casting_role_role_id_fkey;
ALTER TABLE public.casting_role ADD  CONSTRAINT casting_role_role_id_fkey
  FOREIGN KEY (role_id)
  REFERENCES public.role(id)
  ON UPDATE CASCADE ON DELETE RESTRICT;

COMMIT;
