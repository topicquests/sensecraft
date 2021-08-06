-- Deploy sensecraft:conversation_node_functions to pg
-- requires: conversation_node

BEGIN;

\set dbo :dbn '__owner';
\set dbm :dbn '__member';
\set dbc :dbn '__client';

CREATE INDEX conversation_node_ancestry_gist_idx ON conversation_node USING GIST (ancestry);

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.conversation_node TO :dbm;
GRANT USAGE ON SEQUENCE public.conversation_node_id_seq TO :dbm;
GRANT SELECT ON TABLE public.conversation_node TO :dbc;

CREATE FUNCTION node_subtree(node_id int) RETURNS SETOF conversation_node STABLE AS $$
    SELECT * FROM conversation_node WHERE ancestry @ node_id::varchar::ltxtquery ORDER BY ancestry, status DESC, id;
$$ LANGUAGE SQL;


CREATE FUNCTION node_neighbourhood(node_id int, guild int) RETURNS SETOF conversation_node STABLE AS $$
    SELECT DISTINCT * FROM (
      SELECT * FROM conversation_node WHERE ancestry @ node_id::varchar::ltxtquery AND guild_id = guild
      UNION SELECT * FROM conversation_node WHERE
        id = node_id OR
        parent_id = node_id OR
        id = (SELECT parent_id FROM conversation_node WHERE id = node_id)
    ) cn ORDER BY ancestry, status DESC, id;
$$ LANGUAGE SQL;


CREATE FUNCTION playing_in_guild(quest_id integer) RETURNS integer STABLE AS $$
  SELECT guild_id FROM casting WHERE quest_id = quest_id AND member_id = current_member_id();
$$ LANGUAGE SQL;


CREATE OR REPLACE FUNCTION public.check_node_status_rules(status public.publication_state, parent_status public.publication_state, guild_id integer, quest_id integer) RETURNS public.publication_state
  LANGUAGE plpgsql STABLE
  AS $$
BEGIN
  CASE WHEN status = 'submitted' THEN
    IF NOT is_guild_id_leader(guild_id) THEN
      RAISE EXCEPTION 'Only guild leaders can submit nodes';
    END IF;
    -- TODO: The following should not happen if the quest is turn-based
    status := 'published';
  WHEN status = 'published' THEN
    IF NOT is_quest_id_member(quest_id) THEN
      RAISE EXCEPTION 'Only quest members can publish nodes';
    END IF;
  ELSE
  END CASE;
  -- status cannot be higher than parent_status
  IF status > parent_status THEN
    status := parent_status;
  END IF;
  RETURN status;
END$$;

CREATE OR REPLACE FUNCTION public.check_node_type_rules(child_type public.ibis_node_type, parent_type public.ibis_node_type) RETURNS void
  LANGUAGE plpgsql IMMUTABLE
  AS $$
BEGIN
  CASE WHEN parent_type = 'question' THEN
    IF child_type NOT IN ('answer', 'reference') THEN
      RAISE EXCEPTION 'Question node cannot have only have answer or reference as a child';
    END IF;
  WHEN parent_type = 'answer' THEN
    IF child_type = 'answer' THEN
      RAISE EXCEPTION 'Answer node cannot have an answer as a child';
    END IF;
  WHEN parent_type IN ('pro', 'con') THEN
    IF child_type == 'answer' THEN
      RAISE EXCEPTION 'Argument node cannot have an answer node as a child';
    END IF;
  WHEN parent_type = 'reference' THEN
    RAISE EXCEPTION 'Reference node cannot have a child';
  WHEN parent_type IS NULL THEN
    IF child_type NOT IN ('question', 'reference') THEN
      RAISE EXCEPTION 'Root node type must be question or reference';
    END IF;
  ELSE
    RAISE EXCEPTION 'Invalid parent node type';
  END CASE;
END$$;


CREATE OR REPLACE FUNCTION public.before_create_node() RETURNS trigger
  LANGUAGE plpgsql
  AS $$
DECLARE parent_node_type public.ibis_node_type := NULL;
DECLARE parent_status public.publication_state := NULL;
DECLARE parent_quest INTEGER;
DECLARE parent_ancestry ltree;
BEGIN
  NEW.creator_id := current_member_id();
  IF NEW.parent_id IS NOT NULL THEN
    SELECT ancestry, node_type, status, quest_id INTO STRICT parent_ancestry, parent_node_type, parent_status, parent_quest FROM conversation_node WHERE id = NEW.parent_id;
    IF parent_quest != NEW.quest_id THEN
      RAISE EXCEPTION 'Parent node does not belong to the same quest';
    END IF;
    NEW.ancestry = parent_ancestry || NEW.id::varchar::ltree;
  ELSE
    NEW.ancestry = NEW.id::varchar::ltree;
    IF (SELECT count(id) FROM conversation_node WHERE quest_id = NEW.quest_id AND parent_id IS NULL) != 0 THEN
      RAISE EXCEPTION 'Each quest must have a single root';
    END IF;
  END IF;
  PERFORM check_node_type_rules(NEW.node_type, parent_node_type);
  IF NEW.guild_id IS NULL THEN
    SELECT guild_id INTO NEW.guild_id FROM casting WHERE casting.quest_id = NEW.quest_id AND casting.member_id = NEW.creator_id;
  END IF;
  SELECT check_node_status_rules(NEW.status, parent_status, NEW.guild_id, NEW.quest_id) INTO STRICT NEW.status;
  IF NEW.guild_id IS NOT NULL AND NEW.status > 'proposed' AND (SELECT status FROM quests WHERE id = NEW.quest_id) != 'ongoing' THEN
    RAISE EXCEPTION 'Do not submit nodes unless quest is ongoing';
  END IF;
  IF NEW.status = 'published' THEN
    NEW.published_at = now();
  END IF;
  NEW.created_at := now();
  RETURN NEW;
END$$;

CREATE TRIGGER before_create_node BEFORE INSERT ON public.conversation_node FOR EACH ROW EXECUTE FUNCTION public.before_create_node();

CREATE OR REPLACE FUNCTION public.update_node_ancestry(node_id integer, _ancestry ltree) RETURNS void
  LANGUAGE plpgsql
  AS $$
DECLARE _parent_id integer;
DECLARE row record;
BEGIN
  IF _ancestry IS NULL THEN
    SELECT parent_id INTO _parent_id FROM conversation_node WHERE id = node_id;
    IF _parent_id IS NULL THEN
      _ancestry := ''::ltree;
    ELSE
      SELECT ancestry INTO STRICT _ancestry FROM conversation_node WHERE id = _parent_id;
    END IF;
  END IF;
  _ancestry := _ancestry || node_id::varchar::ltree;
  UPDATE conversation_node SET ancestry = _ancestry WHERE id = node_id;
  FOR row IN SELECT id FROM conversation_node WHERE parent_id = node_id
  LOOP
    PERFORM public.update_node_ancestry(row.id, _ancestry);
  END LOOP;
END$$;


CREATE OR REPLACE FUNCTION public.before_update_node() RETURNS trigger
  LANGUAGE plpgsql
  AS $$
DECLARE parent_node_type public.ibis_node_type := NULL;
DECLARE parent_status public.publication_state := NULL;
DECLARE parent_quest INTEGER;
DECLARE children_status public.publication_state := NULL;
DECLARE row record;
BEGIN
  -- those should not change
  IF NEW.creator_id != OLD.creator_id THEN
    RAISE EXCEPTION 'Cannot change creator';
  END IF;
  IF NEW.quest_id != OLD.quest_id THEN
    RAISE EXCEPTION 'Cannot change quest';
  END IF;
  IF NEW.guild_id != OLD.guild_id THEN
    RAISE EXCEPTION 'Cannot change guild';
  END IF;
  IF OLD.status > 'submitted' AND NEW.status < OLD.status THEN
    RAISE EXCEPTION 'Cannot lower status of submitted node';
  END IF;
  IF NEW.parent_id IS NOT NULL THEN
    SELECT node_type, status, quest_id INTO STRICT parent_node_type, parent_status, parent_quest FROM conversation_node WHERE id = NEW.parent_id;
    IF parent_quest != NEW.quest_id THEN
      RAISE EXCEPTION 'Parent node does not belong to the same quest';
    END IF;
  END IF;
  IF COALESCE(NEW.parent_id, -1) != COALESCE(OLD.parent_id, -1) OR NEW.node_type != OLD.node_type THEN
    PERFORM check_node_type_rules(NEW.node_type, parent_node_type);
  END IF;
  IF COALESCE(NEW.parent_id, -1) != COALESCE(OLD.parent_id, -1) OR NEW.status != OLD.status THEN
    SELECT check_node_status_rules(NEW.status, parent_status, NEW.guild_id, NEW.quest_id) INTO STRICT NEW.status;
    IF NEW.status != OLD.status THEN
      SELECT MIN(status) INTO children_status FROM conversation_node WHERE parent_id = NEW.id;
      IF children_status > NEW.status THEN
        RAISE EXCEPTION 'Cannot lower the status below that of children';
      END IF;
    END IF;
    IF NEW.parent_id IS NULL AND (SELECT count(id) FROM conversation_node WHERE quest_id = NEW.quest_id AND parent_id IS NULL AND id != NEW.id) != 0 THEN
      RAISE EXCEPTION 'Each quest must have a single root';
    END IF;
    IF NEW.status = 'published' AND OLD.status < 'published' THEN
      NEW.published_at = now();
    END IF;
  END IF;
  IF NEW.guild_id IS NOT NULL AND NEW.status > 'proposed' AND (SELECT status FROM quests WHERE id = NEW.quest_id) != 'ongoing' THEN
    RAISE EXCEPTION 'Do not submit nodes unless quest is ongoing';
  END IF;
  IF NEW.node_type != OLD.node_type THEN
    FOR row IN SELECT node_type FROM conversation_node WHERE parent_id = NEW.id
    LOOP
      PERFORM check_node_type_rules(row.node_type, NEW.node_type);
    END LOOP;
  END IF;
  RETURN NEW;
END$$;

CREATE TRIGGER before_update_node BEFORE UPDATE ON public.conversation_node FOR EACH ROW EXECUTE FUNCTION public.before_update_node();

CREATE OR REPLACE FUNCTION public.after_update_node() RETURNS trigger
  LANGUAGE plpgsql
  AS $$
BEGIN
  CASE WHEN NEW.id != OLD.id THEN
    IF NEW.parent_id IS NULL THEN
      PERFORM public.update_node_ancestry(NEW.id, NULL);
    ELSE
      PERFORM public.update_node_ancestry(NEW.parent_id, NULL);
    END IF;
  WHEN NEW.parent_id != OLD.parent_id THEN
    PERFORM public.update_node_ancestry(NEW.id, NULL);
  ELSE
  END CASE;
  RETURN NEW;
END$$;

CREATE TRIGGER after_update_node AFTER UPDATE ON public.conversation_node FOR EACH ROW EXECUTE FUNCTION public.after_update_node();

ALTER TABLE public.conversation_node ENABLE ROW LEVEL SECURITY;

CREATE POLICY conversation_node_delete_policy ON public.conversation_node FOR DELETE USING (false);

CREATE POLICY conversation_node_insert_policy ON public.conversation_node FOR INSERT WITH CHECK (
  public.is_quest_id_member(quest_id) OR (
    SELECT COUNT(*) FROM public.casting
    WHERE public.casting.quest_id = public.conversation_node.quest_id
    AND public.casting.member_id = public.conversation_node.creator_id) = 1);

CREATE POLICY conversation_node_select_policy ON public.conversation_node FOR SELECT USING (
  status = 'published' OR
  creator_id = current_member_id() OR
  (status = 'submitted' AND public.is_quest_id_member(quest_id)) OR
  (status > 'private_draft' AND guild_id IS NOT NULL AND guild_id = public.playing_in_guild(quest_id))
);

CREATE POLICY conversation_node_update_policy ON public.conversation_node FOR UPDATE USING (
  (status < 'proposed' AND creator_id = current_member_id()) OR
  (status = 'guild_draft' AND guild_id IS NOT NULL AND guild_id = public.playing_in_guild(quest_id)) OR
  (status >= 'submitted' AND (public.is_quest_id_member(quest_id) OR public.is_guild_id_leader(guild_id)))
);

COMMIT;
