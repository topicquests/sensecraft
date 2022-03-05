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
