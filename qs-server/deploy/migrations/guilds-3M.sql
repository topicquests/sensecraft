-- Deploy guilds


BEGIN;

ALTER TABLE guilds ADD COLUMN default_role_id integer;


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
    guilds.slug,
    guilds.default_role_id
   FROM public.guilds
  WHERE guilds.public;

COMMIT;
