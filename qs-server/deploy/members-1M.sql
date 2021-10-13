-- Deploy members


BEGIN;

ALTER TABLE members ADD COLUMN "slug" character varying(255) GENERATED ALWAYS AS (slugify(handle)) STORED;
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_handle_key;
ALTER TABLE members ADD CONSTRAINT members_slug_key UNIQUE (slug);

COMMIT;
