-- Deploy casting


BEGIN;

ALTER TABLE public.casting
  ADD CONSTRAINT casting_game_play_fkey FOREIGN KEY (quest_id, guild_id)
      REFERENCES public.game_play(quest_id, guild_id) ON UPDATE CASCADE ON DELETE CASCADE

COMMIT;
