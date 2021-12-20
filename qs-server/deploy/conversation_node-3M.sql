-- Deploy conversation_node


BEGIN;

ALTER TABLE conversation_node ADD COLUMN draft_for_role_id INTEGER;
ALTER TABLE conversation_node ADD CONSTRAINT conversation_node_draft_for_role_id_fkey
  FOREIGN KEY (draft_for_role_id) REFERENCES role(id) ON UPDATE CASCADE ON DELETE SET NULL;

COMMIT;
