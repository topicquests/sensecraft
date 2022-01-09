-- Deploy role


BEGIN;

ALTER TABLE guilds DROP CONSTRAINT guilds_default_role_id_fkey;
DROP TABLE IF EXISTS public.role_node_constraint;
DROP TABLE IF EXISTS public.role;
DROP SEQUENCE IF EXISTS public.role_id_seq;

COMMIT;
