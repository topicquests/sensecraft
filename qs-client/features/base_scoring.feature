Feature: Base scoring
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
    