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
              children:
                - type: reference
                  guild: first
        - type: answer
          id: a2
          guild: second
          children:
            - type: con
              id: c1
              guild: first
              children:
                - type: reference
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
              children:
                - type: reference
                  guild: second
        - type: answer
          id: n3
          guild: second
          children:
            - type: con
              guild: first
              children:
                - type: reference
                  guild: first
      """
    When We apply basic scoring
    Then The score of n2 will be higher than the score of n3

  Scenario: A question should be worth at least as much as a counter-argument
    Given A conversation with two options and a threat
      """
      type: question
      id: q1
      children:
        - type: answer
          id: a1
          guild: first
          children:
            - type: pro
              guild: second
              children:
                - type: reference
                  guild: second
        - type: answer
          id: a2
          guild: first
          children:
            - type: question
              id: qa2
              guild: second
              children:
                - type: con_answer
                  id: con_qa2
                  guild: second
                  children:
                    - type: pro
                      guild: second
                      children:
                        - type: reference
                          guild: second
        - type: answer
          id: a3
          guild: first
          children:
            - type: con
              id: con_a3
              guild: second
              children:
                - type: reference
                  guild: second
      """
    When We apply basic scoring
    Then The score of qa2 will be at least the score of con_a3
    And The score of a2 will be at least the score of a3
