CREATE OR REPLACE FUNCTION public.unread_status_list(questid integer) 
RETURNS TABLE (
    node_id integer,
    node_count integer,
    last_read timestamp with time zone,
    seconds_shown interval,
    status int,  
    rstatus boolean  
) AS $$
    SELECT cn.id, COUNT(ds.id) AS sub_size, rs.last_read, MAX(rs.seconds_shown) AS seconds_shown, COUNT(rsd.status) AS sub_size_read, bool_and(rs.status) AS read
FROM conversation_node AS cn
JOIN conversation_node AS ds on (ds.ancestry <@ cn.ancestry)
LEFT OUTER JOIN read_status AS rs on (rs.node_id = cn.id AND rs.member_id = current_member_id() AND rs.last_read >= cn.updated_at)
LEFT OUTER JOIN read_status AS rsd on (rsd.node_id = ds.id AND rsd.member_id = current_member_id() AND rsd.status = true AND rsd.last_read >= ds.updated_at)
WHERE cn.quest_id = questid GROUP BY cn.id, rs.last_read;
$$ LANGUAGE SQL;
