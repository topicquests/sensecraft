-- Migrate guilds from version 0 to 1


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

-- this is actually a function migration, but we don't migrate functions since they're idempotent

do $$
<<first_block>>
DECLARE
  guildrole character varying;
  guildleadrole character varying;
  c RECORD;
BEGIN
  FOR c IN (SELECT id, slug FROM guilds) LOOP
    EXECUTE 'DROP ROLE IF EXISTS ' || current_database() || '__g_' || c.slug;
    EXECUTE 'DROP ROLE IF EXISTS ' || current_database() || '__l_' || c.slug;
    EXECUTE 'DROP ROLE IF EXISTS ' || current_database() || '__g_' || c.id;
    EXECUTE 'DROP ROLE IF EXISTS ' || current_database() || '__l_' || c.id;
  END LOOP;
  FOR c IN (SELECT id FROM guilds) LOOP
      guildrole := current_database() || '__g_' || c.id;
      guildleadrole := current_database() || '__l_' || c.id;
      EXECUTE 'CREATE ROLE ' || guildrole;
      EXECUTE 'CREATE ROLE ' || guildleadrole;
      EXECUTE 'ALTER GROUP ' || guildrole || ' ADD USER ' || current_database() || '__client';
      EXECUTE 'ALTER GROUP ' || guildleadrole || ' ADD USER ' || current_database() || '__client';
  END LOOP;
  FOR c IN (SELECT guild_id, member_id, permissions FROM guild_membership) LOOP
    EXECUTE 'ALTER GROUP ' || current_database() || '__g_' || c.guild_id || ' ADD USER ' || current_database() || '__m_' || c.member_id;
    IF 'guildAdmin' = ANY(c.permissions) THEN
      EXECUTE 'ALTER GROUP ' || current_database() || '__l_' || c.guild_id || ' ADD USER ' || current_database() || '__m_' || c.member_id;
    END IF;
  END LOOP;
END first_block $$;

COMMIT;
