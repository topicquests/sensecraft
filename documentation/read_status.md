# Read status design

## Tables

read_status:
node_id -> conversation_node.id (PK)
member_id -> member.id (PK)
last_read -> datetime
seconds_shown -> interval
force_unread -> boolean default

probably a view on nodes that includes the join with this
function: node N was shown for K seconds (more?) (through websocket?) (only call for unread node.)
OR: nodes N1, N2, ... N_k were shown in the last second. (do all increments)


When creating/updating a node, set the last_read to now (same time as create/modify date.)
A node is unread if last_read is smaller than the nodes's modification date
When seconds_shown is greater than threshold (depends on text length), set last_read to now.


## Store

Question: Do we get read_status as a join in Postgrest, or create a custom view?

What matters are the operations:
node_read(node, sticky: boolean)
node_unread(node)
node_display_time(node, time_delta)

Those could be called from postgrest or the websocket.
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
