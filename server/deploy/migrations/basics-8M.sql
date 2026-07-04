-- Deploy basics


BEGIN;

ALTER TYPE public.permission ADD VALUE IF NOT EXISTS 'readAllRoleChannels' AFTER 'createRoleChannel';

COMMIT;
