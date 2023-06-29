-- Deploy role


BEGIN;

ALTER TABLE public.role DROP COLUMN IF EXISTS node_type_constraints;
ALTER TABLE public.role DROP COLUMN IF EXISTS node_state_constraints;
ALTER TABLE public.role ADD COLUMN IF NOT EXISTS max_pub_state public.publication_state;
ALTER TABLE public.role ADD COLUMN IF NOT EXISTS role_draft_target_role_id integer;
ALTER TABLE public.role ADD CONSTRAINT role_role_draft_target_role_id_fkey FOREIGN KEY (role_draft_target_role_id)
      REFERENCES public.role(id) ON UPDATE CASCADE ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.role_node_constraint (
    role_id integer NOT NULL,
    node_type public.ibis_node_type NOT NULL,
    max_pub_state public.publication_state,
    role_draft_target_role_id integer,
    CONSTRAINT role_node_constraint_pkey PRIMARY KEY (role_id, node_type),
    CONSTRAINT role_node_constraint_role_id_fkey FOREIGN KEY (role_id)
      REFERENCES public.role(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT role_node_constraint_role_draft_target_role_id_fkey FOREIGN KEY (role_draft_target_role_id)
      REFERENCES public.role(id) ON UPDATE CASCADE ON DELETE SET NULL
);

COMMIT;
