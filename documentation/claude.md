# SenseCraft Competitive Scoring System Design
## Conversation-Based Guild Competition with AI Evaluation

---

## Table of Contents
1. [Overview](#overview)
2. [Core Principles](#core-principles)
3. [Scoring Architecture](#scoring-architecture)
4. [AI Role and Constraints](#ai-role-and-constraints)
5. [Model Selection](#model-selection)
6. [Anti-Gaming Safeguards](#anti-gaming-safeguards)
7. [Implementation Details](#implementation-details)
8. [Open Questions](#open-questions)

---

## Overview

This document details the design for SenseCraft's guild-vs-guild competitive scoring system where:

- **Humans create conversation nodes** within quest trees
- **AI evaluates and scores** those nodes
- **Guilds compete** based on aggregated scores
- **No human voting/endorsements** - system is the sole judge

This creates a **machine-evaluated human reasoning competition**.

---

## Core Principles

### 1. Compete on Reasoning Quality, Not Volume
Guilds should win by advancing collective understanding, not by gaming metrics or spamming nodes.

### 2. AI Assists, Never Judges Alone
The system scores using AI evaluation, but:
- Results must be **explainable**
- Formulas must be **transparent** (but exact weights hidden)
- AI is **bounded** in its influence

### 3. Conversation Structure Matters
Since SenseCraft uses conversation trees, structural impact (not just node quality) contributes to scoring:
- Nodes that resolve conflicts
- Nodes that spawn productive branches
- Nodes that enable synthesis

---

## Scoring Architecture

### Three-Layer Model

#### Layer 1: Node Quality Metrics (AI-Evaluated)
Each node receives normalized scores (0-1) across dimensions:

```json
{
  "relevance_to_quest": 0.91,
  "logical_coherence": 0.88,
  "novelty_vs_existing_tree": 0.47,
  "role_alignment": 0.93,
  "constraint_satisfaction": 0.85,
  "information_density": 0.82,
  "confidence": "medium"
}
```

**Key point**: Information density detects "AI-written fluff" (verbose but low-substance content).

#### Layer 2: Node Type Base Values
Different conversation node types have different strategic values:

- **Proposal**: 2 points (base)
- **Evidence**: 5 points (base)
- **Critique**: 3 points (base)
- **Synthesis**: 8 points (base)
- **Decision**: 10 points (base)

#### Layer 3: Structural Bonuses
Rewards conversation graph impact:

- **Influence bonus**: `log(descendant_count + 1)`
- **Bridge bonus**: Nodes that connect subtrees or resolve conflicts
- **Depth bonus**: Sustained reasoning chains

### Node Score Formula

```
node_score = 
  base_value(node_type)
  × average(ai_metrics)
  + structural_bonus
```

**Critical Rule**: Evaluation is done in two passes:
1. **Isolation**: Score node independently
2. **Context**: Score against tree structure
3. **Combine**: Weighted merge

This prevents order effects and cross-guild contamination.

---

## Guild Score Aggregation

Guild scores are **not raw sums** - aggregation includes anti-spam mechanisms:

### 1. Diminishing Returns per Member
Prevents single-player carry or spam strategies:

```
member_contribution = sqrt(sum(member_node_scores))
```

### 2. Role Diversity Bonus
Encourages proper guild composition:

```
if (distinct_roles >= threshold)
  guild_bonus += X
```

### 3. Depth Bonus
Rewards sustained, deep reasoning:

```
depth_bonus = log(max_branch_depth)
```

### 4. Cross-Guild Interaction (Open Decision)
**Important question to resolve:**

> Can guilds endorse or object to nodes created by other guilds?

If yes, cross-guild endorsements could count more (1.5×) to reward persuasion over echo chambers.

---

## AI Role and Constraints

### What AI Does (Allowed)

✅ **Generate structured quality metrics** per node
✅ **Detect novelty** by comparing against entire conversation tree
✅ **Identify structural patterns** (pivots, bridges, dead-ends)
✅ **Explain scores** after quest completion
✅ **Detect low-information content** ("fluff")

### What AI Does NOT Do (Forbidden)

❌ **Assign final points** directly
❌ **Rank or compare guilds**
❌ **Predict winners**
❌ **Provide competitive strategy**
❌ **Override system scoring formula**

### The Golden Rule

> **AI explains the score — it is never the score.**

---

## Model Selection

### Recommended Models

Since this is **evaluation, not generation**, use small-to-mid sized instruction-tuned models:

#### Cloud Option (Safest to Start)
- **GPT-4o mini** ✅ Best choice
  - Excellent instruction-following
  - Strong role-aware evaluation
  - Consistent JSON output
  - Low variance
  - Cost-effective

#### Self-Hosted Options (Control + Transparency)
- **Llama 3.1 8B Instruct** ✅ Solid choice
  - Stable reasoning
  - Predictable outputs
  - Easy to constrain
  - Strong ecosystem

- **Qwen 2.5 7B Instruct** ✅ Sleeper pick
  - Excellent structured output
  - Strong classification
  - Low hallucination rate
  - Deterministic behavior

### Model Size Guidance

| Task | Ideal Size |
|------|-----------|
| Node classification | 3-7B |
| Quality scoring | 7-9B |
| Adoption detection | 7-13B |
| Quest summaries | 13B+ (optional) |

### Models to AVOID

🚫 **Frontier "thinking" models** for scoring:
- GPT-4.1 full
- Claude Opus
- DeepSeek R1

**Why avoid?**
- Too persuasive
- Too "confident"
- Harder to contest outcomes
- Players may feel "the AI decided"

**Remember:** In competition, authority perception matters as much as correctness.

### Configuration Settings (Critical for Fairness)

```javascript
{
  temperature: 0.0,        // Maximum determinism
  top_p: 0.9,              // Controlled sampling
  max_tokens: <capped>,    // Prevent rambling
  json_schema: <strict>    // Mandatory validation
}
```

**If output is invalid → discard & retry.**

---

## Anti-Gaming Safeguards

### Threat Matrix

| Threat | Mitigation |
|--------|-----------|
| Spam nodes | Diminishing returns per member |
| AI-written fluff | Information density metric + novelty check |
| Vote rings | Cross-guild weighting (if applicable) |
| Optimization abuse | Hidden exact weights + frozen model versions |
| Prompt engineering | Evaluator model ≠ popular generation models |

### "AI-Written Fluff" Detection

Even though humans write nodes, they may:
- Use ChatGPT to generate content
- Pad arguments with verbose language
- Optimize for perceived model preferences

**Fluff = high volume, low information density**

Examples:
- Generic philosophical language
- Rewording earlier arguments
- Claim stacking without constraint satisfaction
- Verbose paragraphs without logical structure

**Detection methods:**

1. **Novelty check:**
   > "Does this node introduce new claims, evidence, or logical structure not present in ancestors/siblings?"

2. **Density check:**
   > "Does removing 30% of this text reduce its logical meaning?"

If no to either → score drops.

---

## Implementation Details

### Database Schema

```sql
-- Conversation nodes store signals, not final scores
conversation_nodes {
  id: UUID
  quest_id: UUID
  guild_id: UUID
  author_id: UUID
  role_id: UUID
  parent_id: UUID?
  
  content: TEXT
  node_type: ENUM('proposal', 'evidence', 'critique', 'synthesis', 'decision')
  
  created_at: TIMESTAMP
  
  ai_eval: JSONB  -- Stores evaluation metrics
}

-- Guild scores (computed view or materialized)
guild_scores {
  guild_id: UUID
  quest_id: UUID
  human_contribution: FLOAT
  ai_adjustment: FLOAT
  structural_bonus: FLOAT
  final_score: FLOAT
}
```

### Evaluation Pipeline

```
Node Created
    ↓
Queue Evaluation Job
    ↓
LLM Evaluator (Pass 1: Isolation)
    ↓
LLM Evaluator (Pass 2: Context)
    ↓
Store ai_eval JSONB
    ↓
Compute node_score
    ↓
Aggregate to guild_score
```

### Fairness Controls

1. **Lock model version per season** - Prevents drift
2. **Store raw evaluation JSON** - Enables audit
3. **Never re-score completed quests** - Preserves history
4. **Log prompt versions** - Tracks changes
5. **Transparency of results, opacity of tuning** - Balance fairness and anti-gaming

### End-of-Quest Transparency (Mandatory)

Every competitive quest must conclude with:

1. **Numeric Breakdown**
   - Human contribution
   - AI adjustment
   - Structural bonuses
   - Final scores

2. **Narrative Justification**
   - Why certain nodes mattered
   - How guilds advanced the quest
   - Key turning points

**Example:**
> "Guild A scored higher due to three synthesis nodes that resolved conflicting evidence branches, demonstrating superior constraint satisfaction and logical coherence."

---

## Multi-Pass Evaluation (Optional - Higher Integrity)

For maximum fairness, consider three-pass evaluation:

```
Pass 1: Metric Scoring
  ↓
Pass 2: Contradiction Detection
  ↓
Pass 3: Structural Role Classification
  ↓
Final Score = Weighted Merge
```

This makes gaming extremely difficult.

---

## Advanced Option: Multi-Evaluator Consensus

For critical competitions, use multiple models:

```
Evaluator A (GPT-4o mini)
Evaluator B (Llama 3.1 8B)
Evaluator C (Qwen 2.5 7B)
    ↓
Final Score = Median
```

**Benefits:**
- Reduces single-model bias
- Prevents exploit strategies
- Increases perceived legitimacy

---

## Open Questions

### Critical Design Decisions

1. **Cross-Guild Interaction**
   - Can guilds endorse/object to other guilds' nodes?
   - If yes, how much weight should cross-guild validation have?

2. **Quest Types**
   - Should different quest types have different scoring rules?
   - Examples: knowledge-building, threat-modeling, strategic planning

3. **Rebalancing Strategy**
   - How often can scoring weights be adjusted?
   - How to communicate changes without enabling gaming?

4. **Appeals Process**
   - Can guilds challenge evaluations?
   - What constitutes grounds for review?

5. **Model Updates**
   - How to handle model version upgrades mid-season?
   - Migration strategy for evaluation consistency?

---

## What You're Actually Building

This is not a forum. This is not a debate platform.

**This is a machine-evaluated structured reasoning tournament.**

Success depends on:
- ✅ Stable, deterministic scoring
- ✅ Fluff penalization
- ✅ Structure mattering as much as content
- ✅ Novelty and constraint satisfaction driving competition
- ✅ Explainable outcomes that losing guilds can accept

---

## Summary

**Core Flow:**
1. Humans create conversation nodes in quest trees
2. AI evaluator (GPT-4o mini or Llama 3.1 8B) generates quality metrics
3. System computes node scores using bounded AI multipliers
4. Guild scores aggregate with anti-spam mechanisms
5. End-of-quest transparency report explains outcomes

**Key Safeguards:**
- AI influence capped to prevent dominance
- Information density metric detects fluff
- Diminishing returns prevent spam
- Multi-pass evaluation prevents order effects
- Frozen model versions ensure fairness

**Success Criteria:**
- Guilds compete on reasoning quality
- Outcomes are explainable
- Gaming is difficult
- AI assists but doesn't judge alone

---

## Next Steps

To implement this system, address:

1. **Exact evaluator prompt design** - Critical for consistency
2. **Postgres schema + views** - Store metrics efficiently
3. **Guild score reveal UX** - Make outcomes transparent
4. **Metric weight tuning** - Philosophically align with SenseCraft values
5. **Quest type definitions** - Different quests, different rules
6. **Anti-gaming stress testing** - Red team the system

---

**Document Status**: Design specification based on conversation with Claude (Anthropic)  
**Last Updated**: 2026-02-27  
**Next Review**: After implementation planning phase
