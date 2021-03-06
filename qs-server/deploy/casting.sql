-- Deploy sensecraft:casting to pg
-- requires: quests
-- requires: guilds
-- requires: game_play

BEGIN;


CREATE TABLE IF NOT EXISTS public.casting (
    member_id integer NOT NULL,
    quest_id integer NOT NULL,
    guild_id integer NOT NULL,
    permissions public.permission[] DEFAULT ARRAY[]::public.permission[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,

    CONSTRAINT casting_pkey PRIMARY KEY (quest_id, member_id),
    CONSTRAINT casting_member_id_fkey FOREIGN KEY (member_id)
      REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT casting_quest_id_fkey FOREIGN KEY (quest_id)
      REFERENCES public.quests(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT casting_guild_id_fkey FOREIGN KEY (guild_id)
      REFERENCES public.guilds(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT casting_game_play_fkey FOREIGN KEY (quest_id, guild_id)
      REFERENCES public.game_play(quest_id, guild_id) ON UPDATE CASCADE ON DELETE CASCADE
);


COMMIT;
