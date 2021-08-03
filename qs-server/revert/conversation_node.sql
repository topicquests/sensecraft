-- Revert sensecraft:conversation_node from pg

BEGIN;

DROP TABLE IF EXISTS public.conversation_node;
DROP TYPE IF EXISTS public.ibis_node_type;
DROP TYPE IF EXISTS public.publication_state;

COMMIT;
