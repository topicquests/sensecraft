-- Deploy conversation_node


BEGIN;

ALTER TABLE public.conversation_node ADD COLUMN meta meta_state DEFAULT 'conversation'::meta_state NOT NULL;

ALTER TABLE public.conversation_node ADD COLUMN url varchar(255);

ALTER TABLE public.conversation_node ALTER COLUMN quest_id DROP NOT NULL;

COMMIT;
