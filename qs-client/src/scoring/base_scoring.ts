import { ScoreMap, ThreatMap, ThreatStatus, calc_threat_status } from ".";
import { MaybeRealNode, generic_id } from "../types";
import { ibis_node_type_enum, meta_state_enum } from "../enums";

type NodeById = { [key: generic_id]: MaybeRealNode };
type ParentMap = { [key: generic_id]: generic_id };

// simple algorithm: Reward effective threats/supports.
// TODO: Reward multiple threats/supports in order of arrival.

export function base_scoring(
  node: MaybeRealNode,
  threat_status?: ThreatMap
): ScoreMap {
  if (!threat_status) {
    threat_status = {};
    calc_threat_status(node, threat_status);
  }
  const parent_map: ParentMap = {};
  const nodes = flatten(node, parent_map);
  const scores: ScoreMap = {};
  for (const node_id of Object.keys(threat_status)) {
    const my_guild = nodes[node_id].guild_id;
    switch (threat_status[node_id]) {
      case ThreatStatus.support:
        if (
          parent_map[node_id] == undefined ||
          threat_status[parent_map[node_id]] != ThreatStatus.threatened
        )
          scores[node_id] = 1;
        // Do not reward support if a threat is active.
        else scores[node_id] = 0;
        break;
      case ThreatStatus.threat:
        scores[node_id] = 1;
        break;
      case ThreatStatus.answered:
        scores[node_id] = 0.5;
        break;
      case ThreatStatus.unsupported:
      case ThreatStatus.unanswered:
        scores[node_id] = -0.1;
        break;
      case ThreatStatus.threatened:
        for (const child of nodes[node_id].children || []) {
          if (
            threat_status[child.id] == ThreatStatus.threat &&
            child.guild_id != my_guild
          ) {
            scores[node_id] = -1;
            break;
          }
        }
        break;
    }
  }
  return scores;
}

function flatten(node: MaybeRealNode, parent_map: ParentMap): NodeById {
  let map: NodeById = { [node.id]: node };
  for (const child of node.children || []) {
    if ((child.meta || meta_state_enum.conversation) == meta_state_enum.conversation)
      map = { ...map, ...flatten(child, parent_map) };
  }
  return map;
}
