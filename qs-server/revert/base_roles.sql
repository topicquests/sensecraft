-- Deploy base_roles


BEGIN;

DELETE FROM public.casting_role WHERE role_id IN (SELECT id FROM public.role WHERE guild_id IS NULL AND name IN ('Guild leader', 'Game leader', 'Researcher', 'Scribe', 'Philosopher', 'Critic'));
DELETE FROM public.role WHERE guild_id IS NULL AND name IN ('Guild leader', 'Game leader', 'Researcher', 'Scribe', 'Philosopher', 'Critic');
DROP PROCEDURE IF EXISTS public.create_or_update_base_role(varchar, permission[], ibis_node_type[]);
DROP PROCEDURE IF EXISTS public.create_or_update_base_role(varchar, permission[], public.publication_state, integer, JSON);

COMMIT;
