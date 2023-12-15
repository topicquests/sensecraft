-- Revert sensecraft:quests from pg

BEGIN;

DROP TABLE IF EXISTS public.quest_membership;
DROP TABLE IF EXISTS public.quests;

DO $$
DECLARE roles VARCHAR;
DECLARE curuser VARCHAR;
BEGIN
  SELECT string_agg(rolname, ',') INTO ROLES FROM pg_catalog.pg_roles WHERE rolname LIKE current_database() || '\_\_q\_%';
  curuser := current_user;
  EXECUTE 'SET LOCAL ROLE ' || current_database() || '__rolemaster';
  IF roles IS NOT NULL THEN
    EXECUTE 'DROP ROLE ' || roles;
  END IF;
  EXECUTE 'SET LOCAL ROLE ' || curuser;
END$$;

COMMIT;
