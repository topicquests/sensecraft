-- Revert sensecraft:conversation_node from pg

BEGIN;

DROP TABLE IF EXISTS public.conversation_node;

COMMIT;
