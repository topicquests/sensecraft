-- Revert sensecraft:conversation_node_functions from pg

BEGIN;

\set dbo :dbn '__owner';
\set dbm :dbn '__member';
\set dbc :dbn '__client';

REVOKE SELECT,INSERT,DELETE,UPDATE ON TABLE public.conversation_node FROM :dbm;
REVOKE SELECT ON TABLE public.conversation_node FROM :dbc;

DROP TRIGGER IF EXISTS before_create_node ON public.conversation_node;
DROP TRIGGER IF EXISTS before_update_node ON public.conversation_node;
DROP TRIGGER IF EXISTS after_update_node ON public.conversation_node;

DROP FUNCTION IF EXISTS public.before_create_node();
DROP FUNCTION IF EXISTS public.before_update_node();
DROP FUNCTION IF EXISTS public.after_update_node();
DROP FUNCTION IF EXISTS public.check_node_type_rules(child_type public.ibis_node_type, parent_type public.ibis_node_type);
DROP FUNCTION IF EXISTS public.check_node_status_rules(status public.publication_state, parent_status public.publication_state, guild_id integer, quest_id integer);
DROP FUNCTION IF EXISTS public.update_node_ancestry(node_id integer, _ancestry ltree);
DROP FUNCTION IF EXISTS public.node_subtree(node_id integer);
DROP FUNCTION IF EXISTS public.node_neighbourhood(node_id integer, guild integer);


DROP POLICY IF EXISTS conversation_node_delete_policy ON public.conversation_node;
DROP POLICY IF EXISTS conversation_node_insert_policy ON public.conversation_node;
DROP POLICY IF EXISTS conversation_node_select_policy ON public.conversation_node;
DROP POLICY IF EXISTS conversation_node_update_policy ON public.conversation_node;
ALTER TABLE public.conversation_node DISABLE ROW LEVEL SECURITY;

DROP FUNCTION IF EXISTS public.playing_in_guild(quest_id integer);

DROP INDEX IF EXISTS conversation_node_ancestry_gist_idx;

COMMIT;