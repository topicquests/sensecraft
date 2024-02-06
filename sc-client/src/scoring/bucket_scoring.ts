import { ScoreMap, ThreatMap, ThreatStatus, calc_threat_status } from ".";
import { MaybeRealNode, generic_id } from "../types";
import { ibis_node_type_enum, meta_state_enum } from "../enums";

type ValueForGuild = { [key: generic_id]: number };
type ValuesForGuilds = { [key: generic_id]: ValueForGuild };
type StringSet = { [key: generic_id]: boolean };

export function bucket_scoring(
  node: MaybeRealNode,
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

function find_guilds(node: MaybeRealNode, guilds: StringSet) {
  if (node.guild_id) {
    guilds[node.guild_id] = true;
  }
  for (const child of node.children || []) {
    if (
      (child.meta || meta_state_enum.conversation) ==
      meta_state_enum.conversation
    )
      find_guilds(child, guilds);
  }
}

function base_scoring_internal(
  node: MaybeRealNode,
  guilds: StringSet,
  threat_status: ThreatMap,
  scores: ScoreMap
): ValuesForGuilds {
  let factor = 1.0;
  let values: ValuesForGuilds = {};
  const value_for: ValueForGuild = {};
  for (const guild of Object.keys(guilds)) {
    value_for[guild] = guild == String(node.guild_id) ? 0.0 : 1.0;
  }
  for (const child of node.children || []) {
    if (
      (child.meta || meta_state_enum.conversation) !=
      meta_state_enum.conversation
    )
      continue;
    if (
      threat_status[child.id] == ThreatStatus.threat &&
      node.node_type != ibis_node_type_enum.question
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
  if (node.guild_id && threat_status[node.id] == ThreatStatus.threat) {
    value_for[node.guild_id] += 1.0;
  }
  for (const guild of Object.keys(guilds)) {
    value_for[guild] *= factor;
  }
  values[node.id] = value_for;
  if (node.guild_id) {
    scores[node.id] = value_for[node.guild_id];
  } else {
    scores[node.id] = 0;
  }
  return values;
}
