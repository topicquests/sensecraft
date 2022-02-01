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

  @when(/We identify threats/)
  public identify_threats() {
    ensure_id(this.conversation);
    calc_threat_status(this.conversation, this.threats);
    // console.log(this.threats);
  }

  @when(/We apply basic scoring/)
  public do_scoring() {
    // this.identify_threats();
    ensure_id(this.conversation);
    calc_threat_status(this.conversation, this.threats);
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

  @then(/The threat status of (.*) should be (\w*)/)
  public threat_status(node_id: string, status: ThreatStatus) {
    assert.equal(this.threats[node_id], status);
  }
}
