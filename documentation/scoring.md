# Scoring algorithm

## draft 1

A node's base value is 1.
Given a node X, Given the value matrix of its children.
If the child supports the node, accumulate half that child's value points (that do not come from your own guild.)
For each child threatening the node (which is not itself threatened), halve the total, unless it comes from you.
Responses come as support. Maybe distinguish opening vs threatening questions? Or leave that to answers?
I think some answers to some questions threaten or support the grandparent. The question itself should accrue points from options regardless.

Since I’m interested in whether a node is threatened by another node, I may have to expand IBIS thus: obviously a con threatens an option. In Compendium, a question Q added to a proposal P (or another node type) could be either neutral or “questioning” its parent. But I think asking questions should always be neutral. However, grand-children proposals P2 added to the question Q should declare whether they are supporting or attacking the grand-parent P (or maybe neither.)
A question is threatening if all its non-threatened children are threatening, (ie unless there is an unthreatened non-threatening alternative answer.) I think it begs the question of refactorings: I should be able to neutralize an con, not only with a child counter-argument, but by intercalating a question (and the con would then get converted to a threatening proposal) and adding a non-threatening alternative answer.
Another option is to raise a subquestion to the question with an answer that threatens the question’s relevance. (Also allow direct con to an answer to unask it?)

also... if a threat to my node was neutralized by me, more points?
Or in general, effective threat neutralization is worth something.

Idea; Limit the number of direct attacks (vs counter-attacks.) You have to give a star to someone else to balance.

Structure (assuming a privacy level)
{
  node:
  {
    threatened: boolean
    threatening: boolean
    score: float
    value_for: guild->float
  }
}

threats = 0
supports = 0
factor = 1
value_for[guild] = node.guild == node.guild?0:1
for each child:
  if not child.threatened:
    if child.threatening:
      threats += 1
    else:
      supports +=1
  for each guild:
    value_for[guild] += child.value_for[guild]/2
threatened = threats and not (supports and node.type==question)
threatening = not threatened and (node.type in (con, con_proposal) or (node.type == question and threats and not supports))
if threats:
  factor = 1/2**threats
  threatening = false
if threatening:
  factor *= 2
  value_for[node.guild] += 1 ???
<!-- if node.starred:
  factor *= 2 -->
for each guild:
  value_for[guild] *= factor
score = value_for[node.guild]


select guild_id, sum(score) from (with scores as (select scoring(5)) select id, guild_id, (scores.scoring->id::varchar->'score')::real score from conversation_node, scores where quest_id=1 and status='published') s group by guild_id;

Possibly keep a version that constructs the tree structure with threatening logic in the back.
Have a list of patterns we want to reward and punish, so we can check our scoring methods against them.
That actually puts the fixture task at the forefront.

Jack made the point that maybe scoring should not belong in the backend, and he may be right; though putting it in the frontend means that the frontend always has to load the whole tree instead of a neighbourhood. (I’m also thinking of storing a JS procedure as a field in the quest, and execute it in the backend, but that requires installing plv8, not a very stable extension. Or use plpython, which is more stable. Still thinking through scenarios.) Anyhow…

The real point is that we need to think about varying scoring mechanisms, their costs and benefits. And to do that, we need to build a library of tree patterns that we want to reward or discourage, and test rules against those scenarios. So I decided my priority is making an efficient json format for defining such trees, so we can play. This format would also fulfill the other goals of having fixtures for integration test and a demo setup.

OTH, though I am far from sure about scoring, I am fairly confident about the threat logic and may keep it in the backend. I think we should spend some time thinking about how we’d represent both this and scoring in the frontend.

Note: it would be nice to have threat status be a cached attribute of the nodes, but the fact is that we need two values for each node: the threat status according to the published nodes, and a what-if threat status, probably taking into account proposed nodes. So I think it’s easier to have dynamic calculations.

(Same goes with scoring: Current score based on published nodes, score based on proposed nodes… Maybe even allow thought experiments, showing scoring alterations based on adding a single given node. Hmmmm… this points more and more to frontend calculations.)
