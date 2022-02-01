import {
  Node,
  ScoreMap,
  ThreatMap,
  ThreatStatus,
  calc_threat_status,
  node_local_id,
} from ".";
import { ibis_node_type_enum } from "../enums";

type ValueForGuild = { [key: node_local_id]: number };
type ValuesForGuilds = { [key: node_local_id]: ValueForGuild };
type StringSet = { [key: node_local_id]: boolean };

export function bucket_scoring(
  node: Node,
  threat_status?: ThreatMap
): ScoreMap {
  if (!threat_status) {
    threat_status = {};
    calc_threat_status(node, threat_status);
  }
  const guilds: StringSet = {};
  find_guilds(node, guilds);
  const scores: ScoreMap = {};
  base_scoring_internal(node, guilds, threat_status, scores);
  return scores;
}

function find_guilds(node: Node, guilds: StringSet) {
  if (node.guild) {
    guilds[node.guild] = true;
  }
  for (const child of node.children || []) {
    find_guilds(child, guilds);
  }
}

function base_scoring_internal(
  node: Node,
  guilds: StringSet,
  threat_status: ThreatMap,
  scores: ScoreMap
): ValuesForGuilds {
  const score_map: ScoreMap = {};
  let factor = 1.0;
  let values: ValuesForGuilds = {};
  const value_for: ValueForGuild = {};
  for (const guild of Object.keys(guilds)) {
    value_for[guild] = guild == node.guild ? 0.0 : 1.0;
  }
  const num_threadts = 0;
  for (const child of node.children || []) {
    if (
      threat_status[child.id] == ThreatStatus.threat &&
      node.type != ibis_node_type_enum.question
    ) {
      factor *= 0.5;
    }
    values = {
      ...values,
      ...base_scoring_internal(child, guilds, threat_status, scores),
    };
    for (const guild of Object.keys(guilds)) {
      value_for[guild] += values[child.id][guild] / 2;
    }
  }
  if (node.guild && threat_status[node.id] == ThreatStatus.threat) {
    value_for[node.guild] += 1.0;
  }
  for (const guild of Object.keys(guilds)) {
    value_for[guild] *= factor;
  }
  values[node.id] = value_for;
  if (node.guild) {
    scores[node.id] = value_for[node.guild];
  } else {
    scores[node.id] = 0;
  }
  return values;
}
