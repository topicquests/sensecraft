# Read status design

## Tables

read_status:
node_id -> conversation_node.id (PK)
member_id -> member.id (PK)
last_read -> datetime
seconds_shown -> interval
status -> boolean default null

Note on status: Null means false, false means sticky-false.

probably a view on nodes that includes the join with this. Or a separate table function?

functions:

node_shown_time(node_id integer, seconds float) returns float
Indicate that the (unread) node was on display for N seconds more. Returns the current total for threshold calculations.

node_set_read_status(node_id integer, status boolean, override boolean)
Set the node to fully read or unread.
If the node is set to unread, this is assumed sticky (status=false vs null)
Sending status=true will not affect a sticky-false node, unless override is set.

Rows are created explicitly by the above functions (from FE), or by node create/update.
They are not created preemptively.

I thought of a bulk node time update, but it's actually more trouble to find which nodes have the same read time (scrolling introduces variation)

Maybe introduce a websocket shortcut for those function calls? Or just use postgrest?

Is it worth sending the changes of status to the websocket? Most of the time the change of status will be known to the frontend, and private. Only need is if the user has two screens showing the same nodes.

When creating/updating a node, set the last_read to same time as node create/modify date.

A node is unread if last_read is smaller than the nodes's modification date
When seconds_shown is greater than threshold (depends on text length), set last_read to now. This should be computed on frontend.

eg query:
```sql
SELECT cn.id, COUNT(ds.id) AS sub_size, bool_and(rs.status) AS read, MAX(rs.seconds_shown) AS seconds_shown, COUNT(rsd.status) AS sub_size_read
FROM conversation_node AS cn
JOIN conversation_node AS ds on (ds.ancestry <@ cn.ancestry)
LEFT OUTER JOIN read_status AS rs on (rs.node_id = cn.id AND rs.member_id = 10 AND rs.last_read >= cn.updated_at)
LEFT OUTER JOIN read_status AS rsd on (rsd.node_id = ds.id AND rsd.member_id = 10 AND rsd.status = true AND rsd.last_read >= ds.updated_at)
WHERE cn.quest_id = 7 GROUP BY cn.id;
```

## Store

Question: Do we get read_status as a join in Postgrest, or create a custom view?

The threshold calculation, depending on text length, should be on FE.
last_read is just storage between sessions, the DB won't infer anything from it.

## Frontend:

We want to know when the elements are actually displayed, using the [Intersection observer api](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
The FE could send node_display_time when the page unloads instead of regularly?

## UX:

When node is folded, show *U*/N
where U is the number of unread descendants (bolded)
N is the total number of descendants.
(Hide on unfold.)
If U is 0, just show N.

