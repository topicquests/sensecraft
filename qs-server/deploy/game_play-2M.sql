-- Deploy game_play


BEGIN;

ALTER TABLE public.game_play ADD COLUMN game_status public.game_play_status DEFAULT 'interested'::public.game_play_status NOT NULL;

COMMIT;
