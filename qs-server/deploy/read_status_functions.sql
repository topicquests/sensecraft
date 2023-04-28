-- deploy: read_status_functions
-- requires: read_status
-- idempotent

BEGIN;

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

CREATE OR REPLACE FUNCTION public.node_set_read_status(node_id integer, new_status boolean, override boolean) RETURNS boolean AS $$
    INSERT INTO read_status (node_id, member_id, status)
    VALUES (node_set_read_status.node_id, current_member_id(),
            CASE WHEN NOT override AND NOT new_status THEN NULL ELSE new_status END)
    ON CONFLICT (node_id, member_id) DO UPDATE SET
        status = CASE WHEN override=true THEN new_status WHEN new_status = false THEN new_status ELSE false END,
        seconds_shown = NULL
    RETURNING status;
$$ LANGUAGE sql;

COMMIT;
