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

  @given(/A conversation .*/)
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

  @then(/The score of (.*) will be higher than the score of (.*)/)
  public higher_score(p1, p2) {
    assert.isAbove(this.scores[p1], this.scores[p2]);
  }

  @then(/The threat status of (.*) should be (\w*)/)
  public threat_status(node_id: string, status: ThreatStatus) {
    assert.equal(this.threats[node_id], status);
  }
}
