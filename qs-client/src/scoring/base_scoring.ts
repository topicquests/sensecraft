import {
  ScoreMap,
  ThreatMap,
  ThreatStatus,
  calc_threat_status,
  node_local_id,
} from ".";
import { QTreeNode } from "../types";
import { ibis_node_type_enum } from "../enums";

type NodeById = { [key: node_local_id]: QTreeNode };
type ParentMap = { [key: node_local_id]: node_local_id };

// simple algorithm: Reward effective threats/supports.
// TODO: Reward multiple threats/supports in order of arrival.

export function base_scoring(
  node: QTreeNode,
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
      case ThreatStatus.neutral:
        scores[node_id] = 0.5;
        break;
      case ThreatStatus.unsupported:
      case ThreatStatus.unanswered:
        scores[node_id] = -0.1;
        break;
      case ThreatStatus.threatened:
        const my_guild = nodes[node_id].guild_id;
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

function flatten(node: QTreeNode, parent_map: ParentMap): NodeById {
  let map: NodeById = { [node.id]: node };
  for (const child of node.children || []) {
    map = { ...map, ...flatten(child, parent_map) };
  }
  return map;
}
