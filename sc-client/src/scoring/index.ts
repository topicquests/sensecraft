import { ibis_node_type_enum, meta_state_enum } from "../enums";
import { MaybeRealNode, generic_id } from "../types";

export enum ThreatStatus {
  "answered" = "answered",
  "threat" = "threat",
  "threatened" = "threatened",
  "support" = "support",
  "unsupported" = "unsupported",
  "unanswered" = "unanswered",
}

export type ThreatMap = { [key: generic_id]: ThreatStatus };
export type ScoreMap = { [key: generic_id]: number };

export function ensure_id(node: MaybeRealNode, counter = 0): number {
  node.id = node.id || `_lid_${++counter}`;
  for (const child of node.children || []) {
    if (
      (child.meta || meta_state_enum.conversation) ==
      meta_state_enum.conversation
    )
      counter = ensure_id(child, counter);
  }
  return counter;
}

// logic: references support arguments (unless actively threatened.)
// arguments are either supported or not. supported, non-threatened arguments are either
//   threatening or supporting.
// A solution is similarly threatened, threatening, unsupported... or supporting?
// A question is answered if it has a supported (non-threatening) solution,
// threatening if all (supported) solutions are actively threatening,
// unanswered otherwise

export function calc_threat_status(
  node: MaybeRealNode,
  map: ThreatMap,
  no_req_reference?: boolean
): ThreatStatus {
  let status = ThreatStatus.answered;
  let threats = 0;
  let supports = 0;
  for (const child of node.children || []) {
    if (
      (child.meta || meta_state_enum.conversation) !=
      meta_state_enum.conversation
    )
      continue;
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
  if (node.node_type == ibis_node_type_enum.question) {
    if (supports == 0) {
      if (threats > 0) {
        status = ThreatStatus.threat;
      } else {
        status = ThreatStatus.unanswered;
      }
    } else {
      status = ThreatStatus.answered;
    }
  } else {
    if (threats > 0) {
      status = ThreatStatus.threatened;
    } else if (
      supports == 0 &&
      node.node_type != ibis_node_type_enum.reference &&
      !no_req_reference
    ) {
      status = ThreatStatus.unsupported;
    } else {
      switch (node.node_type) {
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
