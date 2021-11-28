-- Deploy role


BEGIN;

ALTER TABLE guilds ADD CONSTRAINT guilds_default_role_id_fkey FOREIGN KEY (default_role_id)
  REFERENCES public.role(id) ON UPDATE CASCADE ON DELETE SET NULL;

COMMIT;
