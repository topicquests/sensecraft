-- Deploy members


BEGIN;

ALTER TABLE members DROP CONSTRAINT IF EXISTS members_slug_key;
ALTER TABLE members DROP COLUMN "slug";
ALTER TABLE members ADD CONSTRAINT members_handle_key UNIQUE (handle);

COMMIT;
