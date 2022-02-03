Feature: Base scoring
  Scenario: No score without subsequent moves in bucket scoring
    Given A conversation
      """
      node_type: question
      id: q1
      children:
        - node_type: answer
          id: a1
          guild_id: 1
          children:
            - node_type: pro
              id: p1
              guild_id: 1
              children:
                - node_type: reference
                  guild_id: 1
        - node_type: answer
          id: a2
          guild_id: 2
          children:
            - node_type: con
              id: c1
              guild_id: 1
              children:
                - node_type: reference
                  guild_id: 1
      """
    When We apply bucket scoring
    Then The score of q1 is 0
    And  The score of a1 is 0
    And  The score of p1 is 0
    And  The score of c1 is more than 0
    And  The score of a2 is more than 0

  Scenario: Threats affect score
    Given A conversation with two options and a threat
      """
      node_type: question
      children:
        - node_type: answer
          id: n2
          guild_id: 1
          children:
            - node_type: pro
              guild_id: 2
              children:
                - node_type: reference
                  guild_id: 2
        - node_type: answer
          id: n3
          guild_id: 2
          children:
            - node_type: con
              guild_id: 1
              children:
                - node_type: reference
                  guild_id: 1
      """
    When We apply basic scoring
    Then The score of n2 will be higher than the score of n3

  Scenario: A question should be worth at least as much as a counter-argument
    Given A conversation with two options and a threat
      """
      node_type: question
      id: q1
      children:
        - node_type: answer
          id: a1
          guild_id: 1
          children:
            - node_type: pro
              guild_id: 2
              children:
                - node_type: reference
                  guild_id: 2
        - node_type: answer
          id: a2
          guild_id: 1
          children:
            - node_type: question
              id: qa2
              guild_id: 2
              children:
                - node_type: con_answer
                  id: con_qa2
                  guild_id: 2
                  children:
                    - node_type: pro
                      guild_id: 2
                      children:
                        - node_type: reference
                          guild_id: 2
        - node_type: answer
          id: a3
          guild_id: 1
          children:
            - node_type: con
              id: con_a3
              guild_id: 2
              children:
                - node_type: reference
                  guild_id: 2
      """
    When We apply basic scoring
    Then The score of qa2 will be at least the score of con_a3
    And The score of a2 will be at least the score of a3
