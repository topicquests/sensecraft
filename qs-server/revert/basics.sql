-- Deploy sensecraft:basics to pg

BEGIN;

DROP TYPE IF EXISTS public.permission;
DROP TYPE IF EXISTS public.quest_status;
DROP TYPE IF EXISTS public.registration_status;
DROP TYPE IF EXISTS public.player_role;
DROP EXTENSION IF EXISTS pgjwt;
DROP EXTENSION IF EXISTS pgcrypto;
DROP EXTENSION IF EXISTS ltree;


COMMIT;