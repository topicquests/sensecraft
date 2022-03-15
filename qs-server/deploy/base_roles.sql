-- Deploy base_roles
-- requires: role
-- idempotent

BEGIN;

DROP PROCEDURE IF EXISTS public.create_or_update_base_role(
  name_ varchar,
  permissions_ permission[],
  constraintss_ ibis_node_type[]
);

CREATE OR REPLACE PROCEDURE public.create_or_update_base_role(
  name_ varchar,
  permissions_ permission[],
  max_pub_state_ public.publication_state,
  role_draft_target_role_id_ integer,
  node_constraints_ JSON
) LANGUAGE plpgsql AS $$
DECLARE
  role_id_ integer;
  node_type varchar;
  constraints JSON;
BEGIN
  SELECT id INTO role_id_ FROM public.role WHERE name = name_ AND guild_id IS NULL;
  IF role_id_ IS NULL THEN
    INSERT INTO public.role (name, permissions, max_pub_state, role_draft_target_role_id)
      VALUES (name_, permissions_, max_pub_state_, role_draft_target_role_id_) RETURNING id INTO role_id_;
  ELSE
    UPDATE public.role SET permissions = permissions_, max_pub_state=max_pub_state_, role_draft_target_role_id=role_draft_target_role_id_ WHERE id = role_id_;
    DELETE FROM public.role_node_constraint WHERE role_id = role_id_;
  END IF;
  IF node_constraints_ IS NOT NULL THEN
    FOR node_type, constraints IN SELECT * FROM json_each(node_constraints_) LOOP
      INSERT INTO public.role_node_constraint (role_id, node_type, max_pub_state, role_draft_target_role_id)
        VALUES (role_id_, node_type::public.ibis_node_type, (constraints->>'max_pub_state')::public.publication_state, (constraints->>'role_draft_target_role_id')::integer);
    END LOOP;
  END IF;
END$$;

CALL public.create_or_update_base_role('Guild leader', '{"guildAdmin"}', 'submitted', null, null);
CALL public.create_or_update_base_role('Game leader', '{"createPlayChannel", "changeFocus"}', 'submitted', null, null);
CALL public.create_or_update_base_role('Researcher', null, 'guild_draft', null, '{"reference":{"max_pub_state":"proposed"}}'::json);
CALL public.create_or_update_base_role('Scribe', null, 'guild_draft', null, '{"question":{"max_pub_state":"proposed"}}'::json);
CALL public.create_or_update_base_role('Philosopher', null, 'proposed', null, '{"question":{"max_pub_state":"proposed"}, "answer":{"max_pub_state":"proposed"}}'::json);
CALL public.create_or_update_base_role('Critic', null, 'guild_draft', null, '{"question":{"max_pub_state":"proposed"}, "con":{"max_pub_state":"proposed"}}'::json);

COMMIT;
