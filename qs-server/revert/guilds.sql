-- Revert sensecraft:guilds from pg

BEGIN;

DROP TABLE IF EXISTS public.guild_membership;
DROP VIEW IF EXISTS public.public_guilds;
DROP TABLE IF EXISTS public.guilds;

DO $$
DECLARE roles VARCHAR;
DECLARE curuser VARCHAR;
BEGIN
  SELECT string_agg(rolname, ',') INTO ROLES FROM pg_catalog.pg_roles WHERE rolname LIKE current_database() || '\_\_g\_%';
  curuser := current_user;
  EXECUTE 'SET LOCAL ROLE ' || current_database() || '__rolemaster';
  IF roles IS NOT NULL THEN
    EXECUTE 'DROP ROLE ' || roles;
  END IF;
  SELECT string_agg(rolname, ',') INTO ROLES FROM pg_catalog.pg_roles WHERE rolname LIKE current_database() || '\_\_l\_%';
  IF roles IS NOT NULL THEN
    EXECUTE 'DROP ROLE ' || roles;
  END IF;
  EXECUTE 'SET LOCAL ROLE ' || curuser;
END$$;

COMMIT;
