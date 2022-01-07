-- Deploy base_roles


BEGIN;

DELETE FROM public.role WHERE guild_id IS NULL AND name IN ('Guild leader', 'Game leader', 'Researcher', 'Scribe', 'Philosopher', 'Critic');
DROP PROCEDURE IF EXISTS public.create_or_update_base_role(varchar, permission[], ibis_node_type[]);

COMMIT;
