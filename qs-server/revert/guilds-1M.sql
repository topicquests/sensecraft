-- Revert guilds


BEGIN;

CREATE OR REPLACE VIEW public.public_guilds AS
 SELECT guilds.id,
    guilds.handle,
    guilds.name,
    guilds.description,
    guilds.creator,
    guilds.public,
    guilds.open_for_applications,
    guilds.created_at,
    guilds.updated_at
   FROM public.guilds
  WHERE guilds.public;
ALTER TABLE guilds DROP CONSTRAINT IF EXISTS guilds_slug_key;
ALTER TABLE guilds DROP COLUMN "slug";
ALTER TABLE guilds ADD CONSTRAINT guilds_handle_key UNIQUE (handle);

COMMIT;
