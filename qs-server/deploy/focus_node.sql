-- Deploy sensecraft:focus_node to pg
-- requires: conversation_node

BEGIN;

ALTER TABLE game_play ADD COLUMN focus_node_id INTEGER;
ALTER TABLE game_play ADD CONSTRAINT game_play_focus_node_id_fkey FOREIGN KEY (focus_node_id)
      REFERENCES public.conversation_node(id) ON UPDATE CASCADE ON DELETE SET NULL;

COMMIT;
