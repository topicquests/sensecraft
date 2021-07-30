-- Revert sensecraft:quests from pg

BEGIN;

DROP TABLE IF EXISTS public.quest_membership;
DROP VIEW IF EXISTS public.public_quests;
DROP TABLE IF EXISTS public.quests;

DO $$ DECLARE roles VARCHAR;
BEGIN
  SELECT string_agg(rolname, ',') INTO ROLES FROM pg_catalog.pg_roles WHERE rolname LIKE current_database() || '\_\_q\_%';
  IF roles IS NOT NULL THEN
    EXECUTE 'DROP ROLE ' || roles;
  END IF;
END$$;

COMMIT;
