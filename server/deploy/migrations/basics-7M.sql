-- Deploy basics


BEGIN;

ALTER TYPE public.permission ADD VALUE IF NOT EXISTS 'createRoleChannel' AFTER 'createGuildChannel';

COMMIT;
