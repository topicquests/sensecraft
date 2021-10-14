-- Migrate quests from version 0 to 1


BEGIN;

ALTER TABLE quests ADD COLUMN "slug" character varying(255) GENERATED ALWAYS AS (slugify(handle)) STORED;
ALTER TABLE quests DROP CONSTRAINT IF EXISTS quests_handle_key;
ALTER TABLE quests ADD CONSTRAINT quests_slug_key UNIQUE (slug);
CREATE OR REPLACE VIEW public.public_quests AS
 SELECT quests.id,
    quests.handle,
    quests.name,
    quests.description,
    quests.creator,
    quests.public,
    quests.status,
    quests.start,
    quests."end",
    quests.created_at,
    quests.updated_at,
    quests.slug
   FROM public.quests
  WHERE quests.public;

-- this is actually a function migration, but we don't migrate functions since they're idempotent

do $$
<<first_block>>
DECLARE
  rolename character varying;
  c RECORD;
BEGIN
  FOR c IN (SELECT id, slug FROM quests) LOOP
    EXECUTE 'DROP ROLE IF EXISTS ' || current_database() || '__q_' || c.slug;
    EXECUTE 'DROP ROLE IF EXISTS ' || current_database() || '__q_' || c.id;
  END LOOP;
  FOR c IN (SELECT id FROM quests) LOOP
    rolename := current_database() || '__q_' || c.id;
    EXECUTE 'CREATE ROLE ' || rolename;
    EXECUTE 'ALTER GROUP ' || rolename || ' ADD USER ' || current_database() || '__client';
  END LOOP;
  FOR c IN (SELECT quest_id, member_id FROM quest_membership) LOOP
    rolename := current_database() || '__q_' || c.quest_id;
    EXECUTE 'ALTER GROUP ' || current_database() || '__q_' || c.quest_id || ' ADD USER ' || current_database() || '__m_' || c.member_id;
  END LOOP;
END first_block $$;

COMMIT;
