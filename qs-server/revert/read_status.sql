BEGIN;

ALTER TABLE read_status DROP CONSTRAINT IF EXISTS read_status_node_id_fkey;
ALTER TABLE read_status DROP CONSTRAINT IF EXISTS read_status_member_id_fkey;

DROP TABLE IF EXISTS public.read_status;

COMMIT;
