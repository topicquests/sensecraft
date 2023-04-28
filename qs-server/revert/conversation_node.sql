-- Revert sensecraft:conversation_node from pg

BEGIN;

ALTER TABLE read_status DROP CONSTRAINT read_status_node_id_fkey;
DROP TABLE IF EXISTS public.conversation_node;

COMMIT;
