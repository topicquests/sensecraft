-- Deploy sensecraft:game_play to pg
-- requires: guilds
-- requires: quests

BEGIN;

--
-- Name: game_play; Type: TABLE
--

CREATE TABLE IF NOT EXISTS public.game_play (
    guild_id integer NOT NULL,
    quest_id integer NOT NULL,
    status public.registration_status DEFAULT 'confirmed'::public.registration_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    accepted_at timestamp with time zone,
    scores jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT game_play_pkey PRIMARY KEY (guild_id, quest_id),
    CONSTRAINT game_play_guild_id_fkey FOREIGN KEY (guild_id)
      REFERENCES public.guilds(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT game_play_quest_id_fkey FOREIGN KEY (quest_id)
      REFERENCES public.quests(id) ON UPDATE CASCADE ON DELETE CASCADE
);


COMMIT;
