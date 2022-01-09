-- Deploy role


BEGIN;

ALTER TABLE public.role ADD COLUMN IF NOT EXISTS node_type_constraints ibis_node_type[];
ALTER TABLE public.role ADD COLUMN IF NOT EXISTS  node_state_constraints publication_state[];
ALTER TABLE public.role DROP COLUMN IF EXISTS max_pub_state;
ALTER TABLE public.role DROP CONSTRAINT IF EXISTS role_role_draft_target_role_id_fkey;
ALTER TABLE public.role DROP COLUMN IF EXISTS role_draft_target_role_id;

DROP TABLE IF EXISTS public.role_node_constraint;

COMMIT;
