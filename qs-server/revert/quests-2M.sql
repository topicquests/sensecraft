-- Deploy quests


BEGIN;

ALTER TABLE public.quests ALTER COLUMN start DROP NOT NULL;
ALTER TABLE public.quests ALTER COLUMN "end" DROP NOT NULL;

COMMIT;
