-- Deploy basics


BEGIN;

ALTER TYPE public.permission ADD VALUE IF NOT EXISTS 'moveGameMove' AFTER 'retractGameMove';

COMMIT;
