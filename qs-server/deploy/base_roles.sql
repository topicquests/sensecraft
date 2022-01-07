-- Deploy base_roles
-- requires: role
-- idempotent

BEGIN;

CREATE OR REPLACE PROCEDURE public.create_or_update_base_role(
  name_ varchar,
  permissions_ permission[],
  node_type_constraints_ ibis_node_type[]
) LANGUAGE plpgsql AS $$
DECLARE
  role_id integer;
BEGIN
  SELECT id INTO role_id FROM public.role WHERE name = name_ AND guild_id IS NULL;
  IF role_id IS NULL THEN
    INSERT INTO public.role (name, permissions, node_type_constraints) VALUES (name_, permissions_, node_type_constraints_);
  ELSE
    UPDATE public.role SET permissions = permissions_, node_type_constraints = node_type_constraints_ WHERE id = role_id;
  END IF;
END$$;

CALL public.create_or_update_base_role('Guild leader', '{"guildAdmin"}', null);
CALL public.create_or_update_base_role('Game leader', '{"publishGameMove"}', null);
CALL public.create_or_update_base_role('Researcher', null, '{"reference"}');
CALL public.create_or_update_base_role('Scribe', null, '{"question"}');
CALL public.create_or_update_base_role('Philosopher', null, '{"question", "answer"}');
CALL public.create_or_update_base_role('Critic', null, '{"question", "con"}');

COMMIT;
