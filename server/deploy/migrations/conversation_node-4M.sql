-- Deploy conversation_node


BEGIN;

ALTER TABLE conversation_node ADD COLUMN updated_at timestamp with time zone DEFAULT now();
UPDATE conversation_node SET updated_at = created_at;
ALTER TABLE conversation_node ALTER COLUMN updated_at SET NOT NULL;

COMMIT;
