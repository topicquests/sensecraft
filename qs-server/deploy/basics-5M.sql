-- Deploy basics


BEGIN;

CREATE TYPE public.game_play_status AS ENUM (
    'cancelled',
    'interested',
    'confirmed',
    'team_full'
);

COMMIT;
