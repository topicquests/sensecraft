# States
the kinds of states which determine, e.g., which buttons can or cannot be visible

## isAuthenticated
## isAdmin
lots of features will require admin credentials
## canEdit
Traditional projects such as FeatherWeight allowed editing of general content *only* by an Admin, and the content's creator.
### game move nodes
There is to be litigated an entire spectrum of policies about game moves.

#### before publishing
Still inside the guild room being created
Edits make sense
#### after publishing
The game move is now out in public.
Edits (other than what happens when nodes are merged by AI post processing occurs) should be forbidden at any cost. Reason: the *Trust Ethos* of the platform dictates that, if the Quest's results are to be trusted, they must be *immutable*.
## canDelete
Traditionally, projects such as FeatherWeight, deletion, in general, was made available only to Admins.
### conversation nodes
In general, the ability to delete conversation nodes of the type which go on inside a guild, it seems, should follow the pattern, if there are no child nodes, an admin or creator can delete them.
#### game move nodes 
Game move nodes after they are published can *never* be deleted. One could argue that it's reasonable to put, say, a 20 second window on any game tree node once published, to allow for those situations where the "Publish" button was accidentally pushed. One approach to that is to add an UnPublish button the moment the game move was made, but which times out according to whatever "oops" policy the k-hub established. Certainly, deleting an unpublished game move node should be provided to an admin or the creator.
