-- Deploy guilds


BEGIN;

ALTER TABLE guilds ADD COLUMN "slug" character varying(255) GENERATED ALWAYS AS (slugify(handle)) STORED;
ALTER TABLE guilds DROP CONSTRAINT IF EXISTS guilds_handle_key;
ALTER TABLE guilds ADD CONSTRAINT guilds_slug_key UNIQUE (slug);
CREATE OR REPLACE VIEW public.public_guilds AS
 SELECT guilds.id,
    guilds.handle,
    guilds.name,
    guilds.description,
    guilds.creator,
    guilds.public,
    guilds.open_for_applications,
    guilds.created_at,
    guilds.updated_at,
    guilds.slug
   FROM public.guilds
  WHERE guilds.public;

COMMIT;
