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
  "support" = "support",
  "unsupported" = "unsupported",
  "unanswered" = "unanswered",
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

// logic: references support arguments (unless actively threatened.)
// arguments are either supported or not. supported, non-threatened arguments are either
//   threatening or supporting.
// A solution is similarly threatened, threatening, unsupported... or supporting? (neutral? nah.)
// A question is usually neutral, unless all (supported) solutions are actively threatening.
//   then it's threatening as well. We could speak of unanswered questions...
//   But it's functionally equivalent to unsupported. Still worth a name.
// So neutral really only applies to answered questions.

export function calc_threat_status(
  node: Node,
  map: ThreatMap,
  no_req_reference?: boolean
): ThreatStatus {
  let status = ThreatStatus.neutral;
  let threats = 0;
  let supports = 0;
  for (const child of node.children || []) {
    const child_status = calc_threat_status(child, map, no_req_reference);
    switch (child_status) {
      case ThreatStatus.threat:
        threats++;
        break;
      case ThreatStatus.support:
        supports++;
        break;
      case ThreatStatus.threatened:
      case ThreatStatus.unsupported:
    }
  }
  if (node.type == ibis_node_type_enum.question) {
    if (supports == 0) {
      if (threats > 0) {
        status = ThreatStatus.threat;
      } else {
        status = ThreatStatus.unanswered;
      }
    } else {
      status = ThreatStatus.neutral;
    }
  } else {
    if (threats > 0) {
      status = ThreatStatus.threatened;
    } else if (
      supports == 0 &&
      node.type != ibis_node_type_enum.reference &&
      !no_req_reference
    ) {
      status = ThreatStatus.unsupported;
    } else {
      switch (node.type) {
        case ibis_node_type_enum.con:
        case ibis_node_type_enum.con_answer:
          status = ThreatStatus.threat;
          break;
        case ibis_node_type_enum.reference:
        case ibis_node_type_enum.answer:
        case ibis_node_type_enum.pro:
          status = ThreatStatus.support;
          break;
      }
    }
  }
  map[node.id] = status;
  return status;
}
