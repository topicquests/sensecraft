import {
  publication_state_enum,
  ibis_node_type_enum,
  meta_state_enum,
} from "../enums";

export type node_local_id = string | number;

export interface Node {
  id?: node_local_id;
  title: string;
  description?: string;
  quest?: string;
  guild?: string;
  creator: string;
  status: publication_state_enum;
  type: ibis_node_type_enum;
  meta?: meta_state_enum;
  children: Node[];
}

export enum ThreatStatus {
  "neutral" = "neutral",
  "threat" = "threat",
  "threatened" = "threatened",
}

export type ThreatMap = { [key: node_local_id]: ThreatStatus };
export type ScoreMap = { [key: node_local_id]: number };

export function ensure_id(node: Node, counter: number = 0): number {
  node.id = node.id || `_lid_${++counter}`;
  for (const child of node.children || []) {
    counter = ensure_id(child, counter);
  }
  return counter;
}

export function calc_threat_status(node: Node, map: ThreatMap): ThreatStatus {
  let status = ThreatStatus.neutral;
  let threats = 0;
  let supports = 0;
  for (const child of node.children || []) {
    const child_status = calc_threat_status(child, map);
    switch (child_status) {
      case ThreatStatus.threat:
        threats++;
        break;
      case ThreatStatus.neutral:
        supports++;
        break;
      case ThreatStatus.threatened:
    }
  }
  if (threats > 0 && !(node.type == ibis_node_type_enum.question)) {
    status = ThreatStatus.threatened;
  } else {
    switch (node.type) {
      case ibis_node_type_enum.con:
      case ibis_node_type_enum.con_answer:
        status = ThreatStatus.threat;
        break;
      case ibis_node_type_enum.question:
        if (threats > 0 && supports == 0) {
          status = ThreatStatus.threat;
        }
    }
  }
  map[node.id] = status;
  return status;
}
