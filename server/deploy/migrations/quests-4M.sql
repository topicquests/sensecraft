-- Deploy quests


BEGIN;

ALTER TABLE public.quests ADD COLUMN turn_based boolean default false;

COMMIT;
