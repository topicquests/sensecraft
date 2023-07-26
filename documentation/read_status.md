# Read status design

## Tables

read_status:
node_id -> conversation_node.id (PK)
member_id -> member.id (PK)
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

So here are the cases:

old status, status input, override, result status
?, false, ? => false   # Setting to unread (implicitly sticky)
null, true, ? => true   # setting to read from normal unread
false, true, false => false   # setting to read, but no override so sticky false stays
false, true, true => true   # setting to read with override

CASE override=true THEN new_status, new_status = false THEN new_status, status=false


Rows are created explicitly by the above functions (from FE), or by node create/update.
They are not created preemptively.

I thought of a bulk node time update, but it's actually more trouble to find which nodes have the same read time (scrolling introduces variation)

Maybe introduce a websocket shortcut for those function calls? Or just use postgrest?

Is it worth sending the changes of status to the websocket? Most of the time the change of status will be known to the frontend, and private. Only need is if the user has two screens showing the same nodes.

When creating/updating a node reset the read status of all existing rows (to not true...) (and zero the seconds)

When seconds_shown is greater than threshold (depends on text length), set status to read. Threshold should be computed on frontend.

eg query:
```sql
SELECT cn.id, COUNT(ds.id) AS sub_size, bool_and(rs.status) AS read, MAX(rs.seconds_shown) AS seconds_shown, COUNT(rsd.status) AS sub_size_read
FROM conversation_node AS cn
JOIN conversation_node AS ds on (ds.ancestry <@ cn.ancestry)
LEFT OUTER JOIN read_status AS rs on (rs.node_id = cn.id AND rs.member_id = 10)
LEFT OUTER JOIN read_status AS rsd on (rsd.node_id = ds.id AND rsd.member_id = 10 AND rsd.status = true)
WHERE cn.quest_id = 7 GROUP BY cn.id;
```

## Store

Question: Do we get read_status as a join in Postgrest, or create a custom view?

The threshold calculation, depending on text length, should be on FE.

## Frontend:

We want to know when the elements are actually displayed, using the [Intersection observer api](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
The FE could send node_display_time when the page unloads instead of regularly?

## UX:

If node is read, unfolded: White circle with pale shadow
If node is read, folded, with U unread descendants and N descendants: White circle with pale shadow, containing *U*/N (U bolded)
If node is read, folded, with 0 unread descendants and N descendants: White circle with pale shadow, containing N

If node is unread, unfolded: Blue circle
If node is unread, folded, with U unread descendants and N descendants: Blue, with *U*/N in white (U bolded)
If node is unread, folded, with 0 unread descendants and N descendants: White circle with pale shadow, containing N in white
