import { binding, given, then, when } from "cucumber-tsflow";
import { assert } from "chai";
import YAML from "yaml";

import {
  Node,
  ScoreMap,
  ThreatMap,
  ensure_id,
  ThreatStatus,
  calc_threat_status,
} from "../../src/scoring";
import { base_scoring } from "../../src/scoring/base_scoring";

@binding()
export class BaseScoring {
  conversation: Node;
  scores: ScoreMap;
  threats: ThreatMap;

  @given(/A conversation/)
  public init_conversation(text) {
    this.conversation = YAML.parse(text);
    this.scores = null;
    this.threats = {};
  }

  @when(/We identify threats( with references optional)?/)
  public identify_threats(no_req_references) {
    ensure_id(this.conversation);
    calc_threat_status(this.conversation, this.threats, !!no_req_references);
    // console.log(this.threats);
  }

  @when(/We apply basic scoring( with references optional)?/)
  public do_scoring(no_req_references) {
    this.identify_threats(no_req_references);
    this.scores = base_scoring(this.conversation, this.threats);
    // console.log(this.scores);
  }

  @then(/The score of (\w+) is ([0-9\.]+)/)
  public score_value(node_id, value) {
    assert.equal(this.scores[node_id], Number(value));
  }

  @then(/The score of (\w+) is more than ([0-9\.]+)/)
  public score_value_at_least(node_id, value) {
    assert.isAbove(this.scores[node_id], Number(value));
  }

  @then(/The score of (\w+) will be higher than the score of (\w+)/)
  public higher_score(node1, node2) {
    assert.isAbove(this.scores[node1], this.scores[node2]);
  }

  @then(/The score of (\w+) will be at least the score of (\w+)/)
  public higher_or_equal_score(node1, node2) {
    assert.isAtLeast(this.scores[node1], this.scores[node2]);
  }

  @then(/The threat status of (.*) should be (\w*)/)
  public threat_status(node_id: string, status: ThreatStatus) {
    assert.equal(this.threats[node_id], status);
  }
}
