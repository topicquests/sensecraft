-- Deploy quests


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

COMMIT;
