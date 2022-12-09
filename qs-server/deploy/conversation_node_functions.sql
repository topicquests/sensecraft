-- Deploy sensecraft:conversation_node_functions to pg
-- requires: conversation_node
-- requires: casting
-- requires: guilds_functions
-- requires: quests_functions
-- requires: casting_role_functions
-- requires: casting_functions
-- idempotent

BEGIN;

\set dbo :dbn '__owner';
\set dbm :dbn '__member';
\set dbc :dbn '__client';

DROP INDEX IF EXISTS conversation_node_ancestry_gist_idx;
CREATE INDEX conversation_node_ancestry_gist_idx ON conversation_node USING GIST (ancestry);

DROP INDEX IF EXISTS conversation_node_parent_id_idx;
CREATE INDEX conversation_node_parent_id_idx ON conversation_node USING HASH (parent_id);
DROP INDEX IF EXISTS conversation_node_quest_id_idx;
CREATE INDEX conversation_node_quest_id_idx ON conversation_node USING HASH (quest_id);
DROP INDEX IF EXISTS conversation_node_guild_id_idx;
CREATE INDEX conversation_node_guild_id_idx ON conversation_node USING HASH (guild_id);

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.conversation_node TO :dbm;
GRANT USAGE ON SEQUENCE public.conversation_node_id_seq TO :dbm;
GRANT SELECT ON TABLE public.conversation_node TO :dbc;


CREATE OR REPLACE FUNCTION has_node_permission(quest_id INTEGER, node_type public.ibis_node_type, perm public.permission) RETURNS boolean AS $$
  SELECT bool_or(hasp) FROM (
    SELECT is_superadmin() AS hasp
    UNION
    SELECT perm = ANY(coalesce(m.permissions, ARRAY[]::permission[]))
        AND (public.is_playing_quest_in_guild(quest_id) IS NOT NULL OR public.is_quest_id_member(quest_id)) AS hasp
        FROM members m WHERE id = current_member_id()
    UNION
    SELECT (coalesce(gm.permissions, ARRAY[]::permission[]) && ARRAY[perm, 'guildAdmin'::permission]) AS hasp
        FROM guild_membership gm
        JOIN casting c ON (
          c.guild_id = gm.guild_id AND
          c.quest_id = quest_id AND
          c.member_id = gm.member_id)
        WHERE gm.member_id = current_member_id() AND
          gm.status = 'confirmed' AND
          gm.guild_id = public.is_playing_quest_in_guild(quest_id)
    UNION
    SELECT perm = ANY(coalesce(c.permissions, ARRAY[]::permission[])) AS hasp
        FROM casting c
        WHERE c.member_id = current_member_id() AND c.quest_id = quest_id
    UNION
    SELECT perm = ANY(coalesce(r.permissions, ARRAY[]::permission[])) AS hasp
        FROM role r
        JOIN casting_role rc ON (r.id = rc.role_id)
        WHERE rc.member_id = current_member_id() AND rc.quest_id = quest_id
    UNION
    SELECT perm = ANY(coalesce(r.permissions, ARRAY[]::permission[])) AS hasp
        FROM role_node_constraint rnc
        JOIN role r ON (r.id = rnc.role_id)
        JOIN casting_role rc ON (r.id = rc.role_id)
        WHERE rc.member_id = current_member_id() AND rc.quest_id = quest_id AND rnc.node_type = node_type
    ) q
$$ LANGUAGE SQL STABLE;



CREATE OR REPLACE FUNCTION node_subtree(node_id int) RETURNS SETOF conversation_node STABLE AS $$
    SELECT * FROM conversation_node WHERE ancestry @ node_id::varchar::ltxtquery ORDER BY ancestry, status DESC, id;
$$ LANGUAGE SQL;


CREATE OR REPLACE FUNCTION node_neighbourhood(node_id int, guild int DEFAULT NULL) RETURNS SETOF conversation_node STABLE AS $$
    -- this is efficient, but may pick unpublished descendents that are below published excluded descendants.
    -- compensate in FE for now.
    SELECT DISTINCT * FROM (
      SELECT * FROM conversation_node WHERE ancestry @ node_id::varchar::ltxtquery AND guild_id = guild AND status < 'published'
      UNION SELECT * FROM conversation_node
      WHERE status = 'published' AND (
        id = node_id OR
        parent_id = node_id OR
        id = (SELECT parent_id FROM conversation_node WHERE id = node_id)
      )
    ) cn ORDER BY ancestry, status DESC, id;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION nodes2json(node_id integer, include_level public.publication_state DEFAULT 'published', include_meta BOOLEAN DEFAULT false) RETURNS JSONB LANGUAGE plpgsql STABLE AS $$
DECLARE
  node conversation_node;
  quest_handle varchar;
  guild_handle varchar;
  creator_handle varchar;
  role_name varchar;
  result JSONB;
  children_json JSONB[];
BEGIN
  SELECT * INTO STRICT node
    FROM conversation_node
    WHERE conversation_node.id = node_id;
  IF node.meta != 'conversation' AND NOT include_meta THEN
    RETURN 'null'::jsonb;
  END IF;
  IF node.status < include_level THEN
    RETURN 'null'::jsonb;
  END IF;
  SELECT quests.handle, guilds.handle, public_members.handle INTO quest_handle, guild_handle, creator_handle
    FROM conversation_node
    LEFT OUTER JOIN quests ON quests.id = conversation_node.quest_id
    LEFT OUTER JOIN guilds ON guilds.id = conversation_node.guild_id
    LEFT OUTER JOIN public_members ON public_members.id = conversation_node.creator_id
    WHERE conversation_node.id = node_id;
  SELECT array_agg(nodes2json(n.id, include_level, include_meta)) INTO children_json
    FROM conversation_node n
    WHERE n.parent_id = node_id AND n.status >= include_level AND (n.meta = 'conversation' OR include_meta)
    GROUP BY n.id ORDER BY n.id;

  result := jsonb_build_object(
    'id', node.id,
    'node_type', node.node_type::varchar,
    'meta', node.meta::varchar,
    'status', node.status::varchar,
    'title', node.title
  );
  IF array_length(children_json, 1) > 0 THEN
    result := jsonb_set(result, ARRAY['children'], to_jsonb(children_json));
  END IF;
  IF quest_handle IS NOT NULL THEN
    result := jsonb_set(result, ARRAY['quest_id'], to_jsonb(quest_handle));
  END IF;
  IF guild_handle IS NOT NULL THEN
    result := jsonb_set(result, ARRAY['guild_id'], to_jsonb(guild_handle));
  END IF;
  IF creator_handle IS NOT NULL THEN
    result := jsonb_set(result, ARRAY['creator_id'], to_jsonb(creator_handle));
  END IF;
  IF node.description IS NOT NULL THEN
    result := jsonb_set(result, ARRAY['description'], to_jsonb(node.description));
  END IF;
  IF node.url IS NOT NULL THEN
    result := jsonb_set(result, ARRAY['url'], to_jsonb(node.url));
  END IF;
  IF node.draft_for_role_id IS NOT NULL THEN
    SELECT r.name, g.handle INTO STRICT role_name, guild_handle
    FROM public.role r LEFT OUTER JOIN public.guilds g ON g.id = r.guild_id
     WHERE r.id = node.draft_for_role_id;
    IF guild_handle IS NULL THEN
      result := jsonb_set(result, ARRAY['draft_for_role'], to_jsonb(role_name));
    ELSE
      result := jsonb_set(result, ARRAY['draft_for_role'], jsonb_build_object('name', role_name, 'guild', guild_handle));
    END IF;
  END IF;
  RETURN result;
END$$;

CREATE OR REPLACE FUNCTION populate_nodes(data JSONB, parent_id integer DEFAULT NULL) RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
  quest_id INTEGER = NULL;
  guild_id INTEGER = NULL;
  description text = NULL;
  url varchar(255) = NULL;
  creator_id INTEGER;
  node_id INTEGER;
  draft_for_role_id INTEGER = NULL;
  curuser varchar;
  id_map JSONB = '{}'::jsonb;
  child JSONB;
BEGIN
  curuser := current_user;
  IF data->>'creator_id' IS NULL THEN
    RAISE EXCEPTION 'missing creator_id';
  END IF;
  SELECT id INTO STRICT creator_id
    FROM public_members
    WHERE public_members.handle = (data->>'creator_id')::varchar;
  IF creator_id != current_member_id() THEN
    IF NOT is_superadmin() THEN
      RAISE EXCEPTION 'permission superadmin / create nodes as other member';
    END IF;
    EXECUTE 'SET ROLE ' || current_database() || '__m_' || creator_id::text;
  END IF;
  IF data->>'quest_id' IS NOT NULL THEN
    SELECT id INTO STRICT quest_id
      FROM quests
      WHERE quests.handle = (data->>'quest_id')::varchar;
  END IF;
  IF data->>'guild_id' IS NOT NULL THEN
    SELECT id INTO STRICT guild_id
      FROM guilds
      WHERE guilds.handle = (data->>'guild_id')::varchar;
  END IF;
  IF data->'description' IS NOT NULL THEN
    description := (data->>'description')::text;
  END IF;
  IF data->'url' IS NOT NULL THEN
    url := (data->>'url')::VARCHAR;
  END IF;
  IF data->'draft_for_role' IS NOT NULL THEN
    IF data->'draft_for_role'->'name' IS NOT NULL THEN
      SELECT r.id INTO STRICT draft_for_role_id FROM public.role r JOIN public.guilds g ON g.id = r.guild_id WHERE r.name = (data->>'draft_for_role'->'name')::varchar AND g.handle = (data->>'draft_for_role'->'guild')::varchar;
    ELSE
      SELECT r.id INTO STRICT draft_for_role_id FROM public.role r WHERE r.name = (data->>'draft_for_role'->'name')::varchar AND r.guild_id IS NULL;
    END IF;
  END IF;
  INSERT INTO conversation_node ("quest_id", "guild_id", "node_type", "meta", "status", "title", "description", "url", "parent_id", "draft_for_role_id")
    VALUES (quest_id, guild_id,
      (data->>'node_type')::public.ibis_node_type,
      COALESCE(data->>'meta', 'conversation')::public.meta_state,
      'private_draft'::public.publication_state,
      (data->>'title')::varchar, description, url, parent_id, draft_for_role_id)
    RETURNING id INTO STRICT node_id;
  IF data->'lid' IS NOT NULL THEN
    id_map = jsonb_set(id_map, data->>'lid', to_jsonb(node_id));
  END IF;
  EXECUTE 'SET ROLE ' || curuser;
  UPDATE conversation_node SET "status" = COALESCE(data->>'status', 'private_draft')::public.publication_state
    WHERE id = node_id;
  IF data->'children' IS NOT NULL THEN
    FOR child IN SELECT value FROM jsonb_array_elements(data->'children') LOOP
      SELECT populate_nodes(child, node_id) INTO child;
      id_map := id_map || child;
    END LOOP;
  END IF;
  RETURN id_map;
END$$;


CREATE OR REPLACE FUNCTION public.check_node_status_rules(
    status public.publication_state,
    parent_status public.publication_state,
    guild_id integer,
    quest_id integer,
    node_type public.ibis_node_type) RETURNS public.publication_state
  LANGUAGE plpgsql STABLE
  AS $$
DECLARE
  max_role_status public.publication_state;
BEGIN
  IF status = 'published' THEN
    IF NOT (is_quest_id_member(quest_id) OR has_permission('publishGameMove')) THEN
      RAISE EXCEPTION 'permission publishGameMove';  -- need an editQuest permission?
    END IF;
  END IF;
  IF guild_id IS NULL THEN
    IF status >= 'role_draft' AND status <= 'submitted' THEN
      RAISE EXCEPTION 'invalid status / guild statuses require a guild';
    END IF;
  ELSE
    IF quest_id IS NOT NULL AND NOT (public.is_playing_quest_in_guild(quest_id) = guild_id OR is_superadmin()) THEN
      -- create a basic "playGame" permission, automatic on joining?
      RAISE EXCEPTION 'permission playGame / not playing game';
    END IF;
    IF node_type != 'channel' AND NOT is_superadmin() THEN
      SELECT max(max_pub_state) INTO max_role_status FROM public.role_node_constraint
        JOIN casting_role ON casting_role.role_id = role_node_constraint.role_id
        WHERE casting_role.guild_id = check_node_status_rules.guild_id
          AND casting_role.quest_id = check_node_status_rules.quest_id
          AND casting_role.member_id = current_member_id()
          AND role_node_constraint.node_type = check_node_status_rules.node_type;
      SELECT COALESCE(greatest(max_role_status, max(max_pub_state)), 'private_draft') INTO STRICT max_role_status FROM public.role
        JOIN casting_role ON casting_role.role_id = role.id
        WHERE casting_role.guild_id = check_node_status_rules.guild_id
          AND casting_role.quest_id = check_node_status_rules.quest_id
          AND casting_role.member_id = current_member_id();
      status := least(status, max_role_status);
    END IF;
  END IF;
  -- status cannot be higher than parent_status
  status := least(status, parent_status);
  IF status = 'submitted' THEN
    IF NOT (is_guild_id_leader(guild_id) OR is_superadmin())  THEN
      RAISE EXCEPTION 'permission guildAdmin,publishGameMove';
    END IF;
    -- TODO: The following should not happen if the quest is turn-based
    status := 'published';
  END IF;
  RETURN status;
END$$;

CREATE OR REPLACE FUNCTION public.check_node_type_rules(child_type public.ibis_node_type, parent_type public.ibis_node_type) RETURNS void
  LANGUAGE plpgsql IMMUTABLE
  AS $$
BEGIN
  IF child_type = 'channel' AND parent_type IS NOT NULL THEN
    RAISE EXCEPTION 'invalid node_type / Channels must be at root';
  END IF;
  CASE WHEN parent_type = 'question' THEN
    IF child_type NOT IN ('answer', 'reference', 'question', 'con_answer') THEN
      RAISE EXCEPTION 'invalid node_type / Question node can only have answer, con_answer, question, or reference as a child';
    END IF;
  WHEN parent_type IN ('answer', 'con_answer') THEN
    NULL;
  WHEN parent_type IN ('pro', 'con') THEN
    IF child_type = 'answer' THEN
      RAISE EXCEPTION 'invalid node_type / Argument node cannot have an answer node as a child';
    END IF;
  WHEN parent_type = 'reference' THEN
    IF child_type IN ('answer', 'reference') THEN
      RAISE EXCEPTION 'invalid node_type / Reference node cannot have answer or reference as a child';
    END IF;
  WHEN parent_type IS NULL THEN
    IF child_type NOT IN ('question', 'channel') THEN
      RAISE EXCEPTION 'invalid node_type / Root node type must be question or channel';
    END IF;
  WHEN parent_type = 'channel' THEN
    IF child_type NOT IN ('question', 'reference') THEN
      RAISE EXCEPTION 'invalid node_type / Children of channel must be question or reference';
    END IF;
  ELSE
    RAISE EXCEPTION 'invalid node_type / Invalid parent node type';
  END CASE;
END$$;


CREATE OR REPLACE FUNCTION public.before_create_node() RETURNS trigger
  LANGUAGE plpgsql
  AS $$
DECLARE parent_node_type public.ibis_node_type := NULL;
DECLARE parent_status public.publication_state := NULL;
DECLARE parent_quest INTEGER;
DECLARE parent_meta meta_state;
DECLARE parent_ancestry ltree;
BEGIN
  NEW.creator_id := current_member_id();
  IF NEW.parent_id IS NOT NULL THEN
    SELECT ancestry, node_type, status, quest_id, meta INTO STRICT parent_ancestry, parent_node_type, parent_status, parent_quest, parent_meta FROM conversation_node WHERE id = NEW.parent_id;
    IF parent_quest != NEW.quest_id THEN
      RAISE EXCEPTION 'invalid parent_id / Parent node does not belong to the same quest';
    END IF;
    NEW.ancestry = parent_ancestry || NEW.id::varchar::ltree;
    IF parent_meta != 'conversation'::meta_state THEN
      NEW.meta = parent_meta;
    END IF;
  ELSE
    NEW.ancestry = NEW.id::varchar::ltree;
    IF NEW.meta = 'conversation'::meta_state AND (SELECT count(id) FROM conversation_node WHERE quest_id = NEW.quest_id AND parent_id IS NULL AND meta = 'conversation'::meta_state) != 0 THEN
      RAISE EXCEPTION 'invalid parent_id / Each quest must have a single root';
    END IF;
    IF NEW.node_type = 'channel' THEN
      NEW.meta = 'channel'::meta_state;
    ELSE
      NEW.meta = 'conversation'::meta_state;
      IF NEW.quest_id IS NULL THEN
        RAISE EXCEPTION 'invalid quest_id / Quest Id must be defined';
      END IF;
    END IF;
  END IF;
  PERFORM check_node_type_rules(NEW.node_type, parent_node_type);
  IF NEW.guild_id IS NULL THEN
    SELECT guild_id INTO NEW.guild_id FROM casting WHERE casting.quest_id = NEW.quest_id AND casting.member_id = NEW.creator_id;
    IF NEW.guild_id IS NULL AND NEW.node_type = 'channel' THEN
      RAISE EXCEPTION 'missing guild_id / No quest channels';
    END IF;
  ELSE
    IF NEW.node_type = 'channel' THEN
      IF NEW.quest_id IS NULL THEN
        IF NOT public.has_guild_permission(NEW.guild_id, 'createGuildChannel') THEN
          RAISE EXCEPTION 'permission createGuildChannel';
        END IF;
      ELSE
        IF NEW.quest_id IS NOT NULL AND NOT public.has_play_permission(NEW.quest_id, 'createPlayChannel') THEN
          RAISE EXCEPTION 'permission createPlayChannel';
        END IF;
      END IF;
    END IF;
  END IF;
  SELECT check_node_status_rules(NEW.status, parent_status, NEW.guild_id, NEW.quest_id, CASE WHEN NEW.meta = 'conversation' THEN NEW.node_type ELSE 'channel' END) INTO STRICT NEW.status;
  IF NEW.status != 'role_draft' THEN
    NEW.draft_for_role_id = NULL;
  ELSE
    IF NOT public.is_guild_role(NEW.guild_id, NEW.draft_for_role_id) THEN
      RAISE EXCEPTION 'invalid draft_for_role_id / Role must be a guild role';
    END IF;
  END IF;
  IF NEW.guild_id IS NOT NULL AND NEW.status > 'proposed' AND (SELECT status FROM quests WHERE id = NEW.quest_id) != 'ongoing' AND NOT is_superadmin() THEN
    RAISE EXCEPTION 'invalid status / Do not submit nodes unless quest is ongoing';
  END IF;
  IF NEW.status = 'published' THEN
    NEW.published_at = now();
  END IF;
  NEW.created_at := now();
  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS before_create_node ON conversation_node;
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
DECLARE parent_meta meta_state;
DECLARE children_status public.publication_state := NULL;
DECLARE row record;
BEGIN
  -- those should not change
  IF NEW.creator_id != OLD.creator_id THEN
    RAISE EXCEPTION 'immutable creator_id';
  END IF;
  IF NEW.quest_id != OLD.quest_id THEN
    RAISE EXCEPTION 'immutable quest_id';
  END IF;
  IF NEW.guild_id != OLD.guild_id THEN
    RAISE EXCEPTION 'immutable guild_id';
  END IF;
  IF OLD.status > 'submitted' AND NEW.status < OLD.status THEN
    RAISE EXCEPTION 'invalid status / Cannot lower status of submitted node';
  END IF;
  IF NEW.creator_id != current_member_id() AND NOT has_node_permission(NEW.quest_id, NEW.node_type, 'editConversationNode') THEN
    RAISE EXCEPTION 'permission editConversationNode / Cannot change node of other member';
  END IF;
  IF NEW.parent_id IS NOT NULL THEN
    SELECT node_type, status, quest_id, meta INTO STRICT parent_node_type, parent_status, parent_quest, parent_meta FROM conversation_node WHERE id = NEW.parent_id;
    IF parent_quest != NEW.quest_id THEN
      RAISE EXCEPTION 'invalid parent_id / Parent node does not belong to the same quest';
    END IF;
    IF NEW.meta = 'conversation'::meta_state THEN
      IF parent_meta != 'conversation'::meta_state THEN
        NEW.meta = parent_meta;
      END IF;
    ELSE
      IF NEW.meta = 'meta'::meta_state THEN
        IF OLD.meta = 'conversation'::meta_state THEN
          -- allowed if no conversation child
          IF (SELECT count(id) FROM conversation_node WHERE parent_id = NEW.id AND meta = 'conversation'::meta_state) != 0 THEN
            RAISE EXCEPTION 'invalid meta / Cannot change conversation to meta if conversation child exists';
          END IF;
        END IF;
      ELSE
        NEW.meta = parent_meta;
      END IF;
    END IF;
  ELSE
    IF NEW.node_type = 'channel' THEN
      NEW.meta = 'channel'::meta_state;
    ELSE
      NEW.meta = 'conversation'::meta_state;
    END IF;
  END IF;
  IF COALESCE(NEW.parent_id, -1) != COALESCE(OLD.parent_id, -1) OR NEW.node_type != OLD.node_type THEN
    PERFORM check_node_type_rules(NEW.node_type, parent_node_type);
  END IF;
  IF COALESCE(NEW.parent_id, -1) != COALESCE(OLD.parent_id, -1) OR NEW.status != OLD.status THEN
    SELECT check_node_status_rules(NEW.status, parent_status, NEW.guild_id, NEW.quest_id, CASE WHEN NEW.meta = 'conversation' THEN NEW.node_type ELSE 'channel' END) INTO STRICT NEW.status;
    IF NEW.status != OLD.status THEN
      SELECT MIN(status) INTO children_status FROM conversation_node WHERE parent_id = NEW.id;
      IF children_status > NEW.status THEN
        RAISE EXCEPTION 'invalid status / Cannot lower the status below that of children';
      END IF;
    END IF;
    IF NEW.status != 'role_draft' THEN
      NEW.draft_for_role_id = NULL;
    ELSE
      IF NOT public.is_guild_role(NEW.guild_id, NEW.draft_for_role_id) THEN
        RAISE EXCEPTION 'invalid role_id / Role must be a guild role';
      END IF;
    END IF;
    IF NEW.parent_id IS NULL AND NEW.meta = 'conversation'::meta_state AND (
        SELECT count(id) FROM conversation_node
        WHERE quest_id = NEW.quest_id AND parent_id IS NULL
          AND id != NEW.id AND meta = 'conversation'::meta_state) != 0 THEN
      RAISE EXCEPTION 'invalid parent_id / Each quest must have a single root';
    END IF;
    IF NEW.status = 'published' AND OLD.status < 'published' THEN
      NEW.published_at = now();
    END IF;
  END IF;
  IF NEW.guild_id IS NOT NULL AND NEW.status > 'proposed' AND (SELECT status FROM quests WHERE id = NEW.quest_id) != 'ongoing' THEN
    RAISE EXCEPTION 'invalid status / Do not submit nodes unless quest is ongoing';
  END IF;
  IF NEW.node_type != OLD.node_type THEN
    FOR row IN SELECT node_type FROM conversation_node WHERE parent_id = NEW.id
    LOOP
      PERFORM check_node_type_rules(row.node_type, NEW.node_type);
    END LOOP;
  END IF;
  IF NEW.node_type = 'channel' AND OLD.node_type != 'channel' THEN
    IF NEW.quest_id IS NULL THEN
      IF NOT public.has_guild_permission(NEW.guild_id, 'createGuildChannel') THEN
        RAISE EXCEPTION 'permission createGuildChannel';
      END IF;
    ELSE
      IF NEW.quest_id IS NOT NULL AND NOT public.has_play_permission(NEW.quest_id, 'createPlayChannel') THEN
        RAISE EXCEPTION 'permission createPlayChannel';
      END IF;
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS before_update_node ON conversation_node;
CREATE TRIGGER before_update_node BEFORE UPDATE ON public.conversation_node FOR EACH ROW EXECUTE FUNCTION public.before_update_node();


CREATE OR REPLACE FUNCTION public.node_notification_constraints(node public.conversation_node) RETURNS VARCHAR
  LANGUAGE plpgsql
  AS $$
DECLARE public_quest BOOLEAN;
BEGIN
  IF node.meta = 'channel' AND node.quest_id IS NULL THEN
    -- guild channel node only allowed if guild member, maybe role restrictions.
    IF node.status = 'role_draft' THEN
      RETURN concat('G', node.guild_id, ':r', node.draft_for_role_id, ' g', node.guild_id);
    ELSE
      RETURN concat('G', node.guild_id, ' g', node.guild_id);
    END IF;
  ELSE
    SELECT public INTO STRICT public_quest FROM public.quests q WHERE id = node.quest_id;
    CASE node.status
      WHEN 'published' THEN
        -- published game node only allowed if public quest or playing or quest member (Q), only visible if looking at game (p)
        IF public_quest THEN
          RETURN concat('p', node.quest_id);
        ELSE
          RETURN concat('p', node.quest_id, ' P', node.quest_id, '|Q', node.quest_id);
        END IF;
      -- non-published game node (or play channel node) only allowed if playing as that guild (P,P+R,M), only visible if looking at game (p)
      WHEN 'private_draft' THEN
        RETURN concat('p', node.quest_id, ' M', node.creator_id);
      WHEN 'role_draft' THEN
        RETURN concat('p', node.quest_id, ' P', node.quest_id, ':r', node.draft_for_role_id);
      ELSE
        RETURN concat('p', node.quest_id, ' P', node.quest_id);
    END CASE;
  END IF;
END$$;

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
  PERFORM pg_notify(current_database(), concat('U conversation_node ' , NEW.id, ' 0 ', node_notification_constraints(NEW)));
  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS after_update_node ON conversation_node;
CREATE TRIGGER after_update_node AFTER UPDATE ON public.conversation_node FOR EACH ROW EXECUTE FUNCTION public.after_update_node();



CREATE OR REPLACE FUNCTION public.after_insert_node() RETURNS trigger
  LANGUAGE plpgsql
  AS $$
BEGIN
  PERFORM pg_notify(current_database(), concat('C conversation_node ' , NEW.id, ' 0 ', node_notification_constraints(NEW)));
  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS after_insert_node ON conversation_node;
CREATE TRIGGER after_insert_node AFTER INSERT ON public.conversation_node FOR EACH ROW EXECUTE FUNCTION public.after_insert_node();


CREATE OR REPLACE FUNCTION public.after_delete_node() RETURNS trigger
  LANGUAGE plpgsql
  AS $$
DECLARE db_name VARCHAR = current_database();
BEGIN
  PERFORM pg_notify(current_database(), concat('D conversation_node ' , OLD.id, ' 0 ', node_notification_constraints(OLD)));
  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS after_delete_node ON conversation_node;
CREATE TRIGGER after_delete_node AFTER DELETE ON public.conversation_node FOR EACH ROW EXECUTE FUNCTION public.after_delete_node();


ALTER TABLE public.conversation_node ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conversation_node_delete_policy ON public.conversation_node;
CREATE POLICY conversation_node_delete_policy ON public.conversation_node FOR DELETE USING (false);


DROP POLICY IF EXISTS conversation_node_insert_policy ON public.conversation_node;
CREATE POLICY conversation_node_insert_policy ON public.conversation_node FOR INSERT WITH CHECK (
  public.is_quest_id_member(quest_id) OR (
    quest_id IS NULL AND (
      parent_id IS NOT NULL OR public.has_guild_permission(guild_id, 'createGuildChannel'::public.permission))  -- we should have a "create channel" permission
  ) OR (
    SELECT COUNT(*) FROM public.casting
    WHERE public.casting.quest_id = public.conversation_node.quest_id
    AND public.casting.guild_id = public.conversation_node.guild_id
    AND public.casting.member_id = public.conversation_node.creator_id) = 1);

DROP POLICY IF EXISTS conversation_node_select_policy ON public.conversation_node;
CREATE POLICY conversation_node_select_policy ON public.conversation_node FOR SELECT USING (
  status = 'published' OR
  creator_id = current_member_id() OR
  (status = 'submitted' AND public.is_quest_id_member(quest_id)) OR
  (status = 'role_draft' AND guild_id IS NOT NULL AND quest_id IS NOT NULL AND has_game_role(quest_id, guild_id, draft_for_role_id)) OR
  (status = 'role_draft' AND guild_id IS NOT NULL AND quest_id IS NULL AND can_play_role(guild_id, draft_for_role_id)) OR
  (status > 'role_draft' AND guild_id IS NOT NULL AND guild_id = public.is_playing_quest_in_guild(quest_id)) OR
  (status > 'role_draft' AND guild_id IS NOT NULL AND quest_id IS NULL AND public.is_guild_id_member(guild_id))
);

DROP POLICY IF EXISTS conversation_node_update_policy ON public.conversation_node;
CREATE POLICY conversation_node_update_policy ON public.conversation_node FOR UPDATE USING (
  (status <= 'proposed' AND creator_id = current_member_id()) OR
  (status = 'role_draft' AND guild_id IS NOT NULL AND quest_id IS NOT NULL AND has_game_role(quest_id, guild_id, draft_for_role_id)) OR
  (status = 'role_draft' AND guild_id IS NOT NULL AND quest_id IS NULL AND can_play_role(guild_id, draft_for_role_id)) OR
  (status >= 'guild_draft' AND guild_id IS NOT NULL AND guild_id = public.is_playing_quest_in_guild(quest_id)) OR
  (status >= 'guild_draft' AND guild_id IS NOT NULL AND quest_id IS NULL AND public.is_guild_id_member(guild_id)) OR
  (status >= 'submitted' AND (public.is_quest_id_member(quest_id) OR public.is_guild_id_leader(guild_id)))
);

DROP FUNCTION IF EXISTS playing_in_guild(quest_id integer);

COMMIT;
