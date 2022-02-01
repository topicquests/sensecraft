Feature: Base scoring
  Scenario: No score without subsequent moves
    Given A conversation
      """
      type: question
      id: q1
      children:
        - type: answer
          id: a1
          guild: first
          children:
            - type: pro
              id: p1
              guild: first
        - type: answer
          id: a2
          guild: second
          children:
            - type: con
              id: c1
              guild: first
      """
    When We apply basic scoring
    Then The score of q1 is 0
    And  The score of a1 is 0
    And  The score of p1 is 0
    And  The score of c1 is more than 0
    And  The score of a2 is more than 0

  Scenario: Threats affect score
    Given A conversation with two options and a threat
      """
      type: question
      children:
        - type: answer
          id: n2
          guild: first
          children:
            - type: pro
              guild: second
        - type: answer
          id: n3
          guild: second
          children:
            - type: con
              guild: first
      """
    When We apply basic scoring
    Then The score of n2 will be higher than the score of n3
