-- Deploy quests


BEGIN;

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
    quests.updated_at
   FROM public.quests
  WHERE quests.public;
ALTER TABLE quests DROP CONSTRAINT IF EXISTS quests_slug_key;
ALTER TABLE quests DROP COLUMN "slug";
ALTER TABLE quests ADD CONSTRAINT quests_handle_key UNIQUE (handle);

COMMIT;
