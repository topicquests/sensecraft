-- Deploy conversation_node


BEGIN;

ALTER TABLE conversation_node DROP CONSTRAINT conversation_node_draft_for_role_id_fkey;
ALTER TABLE conversation_node DROP COLUMN draft_for_role_id;

COMMIT;
