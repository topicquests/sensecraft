-- deploy: read_status_functions
-- requires: read_status
-- requires: members_functions
-- idempotent

BEGIN;

\set dbo :dbn '__owner';
\set dbm :dbn '__member';
\set dbc :dbn '__client';

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.read_status TO :dbm;
GRANT SELECT, INSERT ON TABLE public.read_status TO :dbc;

CREATE OR REPLACE FUNCTION public.unread_status_list(rootid integer)
RETURNS TABLE (
    node_id integer,
    node_count integer,
    seconds_shown interval,
    status boolean,
    read_count integer
) AS $$
    SELECT cn.id, COUNT(ds.id) AS node_count, MAX(rs.seconds_shown) AS seconds_shown, rs.status, COUNT(rsd.node_id) AS read_count
    FROM conversation_node AS cn
    JOIN conversation_node AS ds on (ds.ancestry <@ cn.ancestry)
    LEFT OUTER JOIN read_status AS rs on (rs.node_id = cn.id AND rs.member_id = current_member_id())
    LEFT OUTER JOIN read_status AS rsd on (rsd.node_id = ds.id AND rsd.member_id = current_member_id() AND rsd.status = true)
    WHERE rootid::varchar::ltree @> cn.ancestry
    GROUP BY cn.id, rs.status;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION public.node_shown_time(node_id integer, seconds float) RETURNS interval AS $$
    INSERT INTO read_status (node_id, member_id, seconds_shown) VALUES (node_shown_time.node_id, current_member_id(), make_interval(secs=>seconds))
    ON CONFLICT (node_id, member_id) DO UPDATE SET
        seconds_shown = COALESCE(read_status.seconds_shown, make_interval()) + make_interval(secs=>seconds)
    RETURNING seconds_shown;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION public.node_set_read_status(
    nodeid integer,
    new_status boolean,
    override boolean
) RETURNS TABLE (new_node_id integer, new_member_id integer, status_new boolean) AS $$
BEGIN
    INSERT INTO read_status (node_id, member_id, status)
    VALUES (nodeid, current_member_id(),
            CASE WHEN NOT override AND NOT new_status THEN NULL ELSE new_status END)
    ON CONFLICT (node_id, member_id) DO UPDATE SET
        status = CASE WHEN override=true THEN new_status
                      WHEN new_status = false THEN new_status
                      ELSE false END,
        seconds_shown = NULL
    RETURNING read_status.node_id, read_status.member_id, read_status.status
    INTO STRICT new_node_id, new_member_id, status_new;
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION public.reset_read_status() RETURNS TRIGGER AS $$
DECLARE curuser varchar;
DECLARE curuser_id integer;
BEGIN
    IF OLD.title != NEW.title OR OLD.description != NEW.description THEN
        curuser := current_user;
        curuser_id := COALESCE(current_member_id(), -1);
        EXECUTE 'SET LOCAL ROLE ' || current_database() || '__owner';
        UPDATE read_status
            SET status = NULL
            WHERE node_id = NEW.id
            AND member_id != curuser_id
            AND status = true;
        EXECUTE 'SET LOCAL ROLE ' || curuser;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_update_node_clear_read_status ON public.conversation_node;
CREATE TRIGGER after_update_node_clear_read_status AFTER UPDATE ON public.conversation_node FOR EACH ROW EXECUTE FUNCTION public.reset_read_status();


ALTER TABLE public.read_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS read_status_update_policy ON public.read_status;
CREATE POLICY read_status_update_policy ON public.read_status FOR UPDATE USING (public.is_superadmin() OR member_id = public.current_member_id());
DROP POLICY IF EXISTS read_status_insert_policy ON public.read_status;
CREATE POLICY read_status_insert_policy ON public.read_status FOR INSERT WITH CHECK (member_id = public.current_member_id());
DROP POLICY IF EXISTS read_status_select_policy ON public.read_status;
CREATE POLICY read_status_select_policy ON public.read_status FOR SELECT USING (public.is_superadmin() OR member_id = public.current_member_id());
DROP POLICY IF EXISTS read_status_delete_policy ON public.read_status;
CREATE POLICY read_status_delete_policy ON public.read_status FOR DELETE USING (public.is_superadmin() OR member_id = public.current_member_id());

COMMIT;
