-- Migrate members from version 0 to 1


BEGIN;

\set dbc :dbn '__client';

ALTER TABLE members ADD COLUMN "slug" character varying(255) GENERATED ALWAYS AS (slugify(handle)) STORED;
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_handle_key;
ALTER TABLE members ADD CONSTRAINT members_slug_key UNIQUE (slug);
CREATE OR REPLACE VIEW public.public_members (id, handle, slug, permissions) AS
SELECT
    id,
    handle,
    slug,
    permissions FROM public.members;

REVOKE SELECT ON TABLE public.members FROM :dbc;

-- this is actually a function migration, but we don't migrate functions since they're idempotent

do $$
<<first_block>>
DECLARE
  rolename character varying;
  c RECORD;
BEGIN
  FOR c IN SELECT id, slug FROM members LOOP
    EXECUTE 'DROP ROLE IF EXISTS ' || current_database() || '__m_' || c.slug;
    EXECUTE 'DROP ROLE IF EXISTS ' || current_database() || '__m_' || c.id;
  END LOOP;
  FOR c IN SELECT id, permissions FROM members LOOP
    rolename := current_database() || '__m_' || c.id;
    EXECUTE 'CREATE ROLE ' || rolename || ' INHERIT IN GROUP ' || current_database() || '__member';
    EXECUTE 'ALTER GROUP ' || rolename || ' ADD USER ' || current_database() || '__client';
    IF 'superadmin' = ANY(c.permissions) THEN
      EXECUTE 'ALTER GROUP '||current_database()||'__owner ADD USER ' || rolename;
    END IF;
  END LOOP;
END first_block $$;

COMMIT;
