-- Revert sensecraft:members from pg

BEGIN;

ALTER TABLE read_status DROP CONSTRAINT read_status_member_id_fkey;

DROP VIEW IF EXISTS public.public_members;

DROP TABLE IF EXISTS public.members;

DO $$ DECLARE roles VARCHAR;
BEGIN
  SELECT string_agg(rolname, ',') INTO ROLES FROM pg_catalog.pg_roles WHERE rolname LIKE current_database() || '\_\_m\_%';
  IF roles IS NOT NULL THEN
    EXECUTE 'DROP ROLE ' || roles;
  END IF;
END$$;

COMMIT;
