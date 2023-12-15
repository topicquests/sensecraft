-- Deploy conversation_node


BEGIN;

DELETE FROM public.conversation_node WHERE quest_id IS NULL;
DELETE FROM public.conversation_node WHERE meta_state != 'conversation'::meta_state;
DELETE FROM public.conversation_node WHERE node_type = 'channel'::ibis_node_type;
UPDATE public.conversation_node SET status = 'private_draft' WHERE status = 'role_draft';

ALTER TABLE public.conversation_node DROP COLUMN url;
ALTER TABLE public.conversation_node DROP COLUMN meta;

ALTER TABLE public.conversation_node ALTER COLUMN quest_id NOT NULL;

COMMIT;
