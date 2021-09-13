-- Revert sensecraft:focus_node from pg

BEGIN;

ALTER TABLE game_play DROP CONSTRAINT game_play_focus_node_id_fkey;
ALTER TABLE game_play DROP COLUMN focus_node_id;

COMMIT;
