# Scoring algorithm

## Threat model

logic: 
References are self-supporting, and (unless actively threatened) support their parent argument or answer.
An argument or answer with a threatening child is threatened.
A con argument is threatening if it's supported and not threatened.
A question is threatening if it has a supported con_answer and no supported answer.
In the current model, arguments need the support of a reference. (This should be a choice.)
So an argument or answer which is supported and not threatened is itself a support.
In the current model, arguments need the support of a reference. (This should be a choice; arguments could be supported by default.)
An argument or answer which is neither supported nor threatened is unsupported.
A question with con_answers in threat state and no supported answer is itself a threat.
A question with answer in support threat is answered;
A question without answers in threat or support state is unsupported.

Note the creation of the con_answer, which effectively threatens the parent of its question, i.e. its grandparent, to replace the "threatening" question-relation. The question should not be inherently threatening, but some answers are.)
TODO: threat model (on published nodes) should have impact on neighbourhood, and should be calculated in backend.
TODO?: Maybe con_reference as a shortcut for a referenced con.
## Bucket scoring

This is a reinterpretation the Future Engine's scoring.

A node's base value is 1 for the creator's guild.
Given a node, its value is its base value, plus half the sum of the values of all its children (and recursively) without taking into account the value of descendants of the node's guild.

(The current algorithm does not yet reflects this, but mixes threat aspects.)
## Threat scoring

This is currently implemented in `base_scoring.ts`
The aim is to reward both answers/arguments that stand to criticism, and the criticism itself; and to penalize weak arguments. (and slightly penalize unsupported arguments)

Node values are given as follows:

threat: 1
answered: 0.5
unsupported/unanswered: -0.1
support: 1 if unthreatened, 0 otherwise
threatened: -1 if threatened by another guild, 0 otherwise.

##  Further thinking

We need to think about varying scoring mechanisms, their costs and benefits. And to do that, we need to build a library of tree patterns that we want to reward or discourage. See the Gherkin+Yaml files for examples.

Here are a few possible improvements or alternate mechanisms:

The threat scoring should give decreasing value to successive active threat/support.
(The age of an answer/argument may be not be the time of creation/publication, but the last time it was not in threatened status.)

We also want to favour more constructive/prosocial actions than just coming up with new answers.
(Recall we may want multiple score values, at least score criticisms and support on a different axis of the value matrix.)

One possibility:
Favour answers that build on other guild's answers. This would mean adding a field for explicit cross-references.
(There would be a penalty for publishing an answers that builds on another and does not quote it, presumably.)
Ideally, an answer that builds on another in a way that the other guild agrees should be worth even more.
We could also allow cross-quests references that way.

But there is always the issue of the scoring distorting the truth; a team may withhold agreement that they do feel to avoid giving points to the other guild. (Sigh.) (Would not apply if the decision is binding IRL, presumably.)

In general, we could ask people to rate the best (worst?) moves from any other guild.

maybe: Limit the number of direct attacks (vs counter-attacks.) You have to give a star to someone else to balance.

The system should encourage cooperative refactoring moves, eg combining two solutions, with shared credit.
The idea of shared credit is also important for similar ideas in a turn-based system.

There was also a question from Byron about the balance between agency and team spirit, both within and between the guild.
We could have internal scores for good play within a guild.


## Scoring as learning

I owe the initial idea to Alexandre Enkerli (https://scholar.social/@enkerli). Following [Epistemic Justice](https://en.wikipedia.org/wiki/Epistemic_injustice), the players should have a collective discussion about what matters in the conversation, and that would be a more full learning experience than scoring by an authority or an abstract mechanism. The advantage of this is that it turns SenseCraft even more explicitly into an epistemic research process.

There are many ways to implement this, this is a strawman proposal, to be discussed collectively:

1. The quest setup should include a definition of bounties, in the form of tokens that will be awarded throughout the quest.
   1. External tokens tokens will be handed out to players, to be given (mandatory) to players with whom they do not share a playing guild.
   2. Internal tokens will be handed out to players (or only to play leaders?) to be handed in-team (optional.)
   3. Quest tokens will be awarded by quest sponsors (of few of which may be optional, such as for a proposal without identified major downsides, and costs within a preset boundary.)
   4. Learning guilds (aka CoP) can co-sponsor the quest, and will also have quest tokens. (optional?)
2. The play setup should have a list of epistemic patterns that it defines as worthy of reward. Such moves can be defined by the hub, the quest, playing guilds or learning guilds.
   1. Eg of epistemic pattern: Convincing evidence, original position, synthetic position, etc.
3. At any point in the game, token holders would spend tokens to indicate that someone's game move is exemplary according to one of the identified patterns.
   1. Variant: allow participants (whether guild or quest) to identify new epistemic patterns during the game. (These should be limited in number, and should probably be made public on the moment.)
   2. Option 1: Do so openly, and token spending can be argued. Allow re-spending a contested token.
      1. Note: It makes spending tokens difficult, which can become an interesting game dynamic; but then allow an arbitration mechanism against spurious contestation. I think that arguing about evaluations is a necessary part of the dynamic.
   3. Option 2: Do so in secret, allow change throughout the game.
      1. Variant (Balderdash): reward game moves in quadratic proportion no the number of people spending tokens on it.
      2. I think that secret evaluation at the end of the game would lose much proposal value, but would make a lot of sense in a turn-based game, much the same way that I was considering turn-based publication. People could then have per-turn un-changeable tokens.
   4. Implementation:
      1. If token allocation can be contested, they could become a kind of conversation move... Question: Should each token allocation be justified upon creation or only if contested?
      2. Are tokens instead a kind of conversation move marker? (Eg flagging abuse, support/contest, censorship...)
         1. Tokens are consumed by usage, unlike markers.
         2. It makes sense to contest some markers, not all. Similarly, some markers are subject to review against abuse.
         3. Markers and tokens have visibility cycle, like conversation moves. Visibility may not be linear.
         4. Query patterns for markers and tokens are aggregates, really unlike those of conversation moves. (AND not postgrest-friendly... view?)
         5. Some markers are temporary (eg approve a revision; consumed when revision is integrated.)
         6. Markers don't have a title? (ie. the marker type is the title.)
         7. Do markers have a quantitative value? I like the idea of using markers as criterion evaluation votes.
      3. Tentative: Markers as a separate table, but option to create a conversation node that's bound to a marker. It could then share the marker's Id. You could reply to an un-materialized marker? That's obviously more difficult. Token allocation... same table or joined? Marker have a non-nullable target, whereas tokens start with null target. OTH, same table means less joins. Ok, do that.
4. Unspent mandatory (external) tokens are held against the guild's total.
5. Tokens earned against an epistemic pattern eventually earn you a badge for that pattern.
   1. There should be alignment between those patterns and roles, to be developed. Maybe you need a certain level of badge for a pattern to earn a role.
6. Guilds could make expertise with certain epistemic pattern a signature
7. Learning guilds would mostly reward specific expertise, rather than an epistemic pattern.
