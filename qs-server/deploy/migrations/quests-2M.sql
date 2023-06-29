-- Deploy quests


BEGIN;

UPDATE public.quests SET start = now() + 'P1W' WHERE start IS NULL;
UPDATE public.quests SET "end" = now() + 'P1Y' WHERE "end" IS NULL;

ALTER TABLE public.quests ALTER COLUMN start SET NOT NULL;
ALTER TABLE public.quests ALTER COLUMN "end" SET NOT NULL;

COMMIT;
