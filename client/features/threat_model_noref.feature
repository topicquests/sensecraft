@scoring
Feature: Threat model
  Scenario: Con is a threat
    Given A conversation with a con
      """
      node_type: question
      id: q1
      children:
        - node_type: answer
          id: a1
          children:
            - node_type: con
              id: con1
      """
    When We identify threats with references optional
    Then The threat status of q1 should be unanswered
    And  The threat status of a1 should be threatened
    And  The threat status of con1 should be threat

  Scenario: Con neutralized by a con
    Given A conversation with a con neutralized by a con
      """
      node_type: question
      id: q1
      children:
        - node_type: answer
          id: a1
          children:
            - node_type: con
              id: con1
              children:
                - node_type: con
                  id: con2
      """
    When We identify threats with references optional
    Then The threat status of q1 should be answered
    And  The threat status of a1 should be support
    And  The threat status of con1 should be threatened
    And  The threat status of con2 should be threat

  Scenario: Question with con_answer
    Given A conversation with a con_answer
      """
      node_type: question
      id: q1
      children:
        - node_type: con_answer
          id: ca1
      """
    When We identify threats with references optional
    Then The threat status of q1 should be threat
    And  The threat status of ca1 should be threat

  Scenario: Question with con_answer and alternative
    Given A conversation with a con_answer and an alternative
      """
      node_type: question
      id: q1
      children:
        - node_type: con_answer
          id: ca1
        - node_type: answer
          id: a2
      """
    When We identify threats with references optional
    Then The threat status of q1 should be answered
    And  The threat status of ca1 should be threat
    And  The threat status of a2 should be support

  Scenario: Question with con_answer and threatened alternative
    Given A conversation with a con_answer and a threatened alternative
      """
      node_type: question
      id: q1
      children:
        - node_type: con_answer
          id: ca1
        - node_type: answer
          id: a2
          children:
            - node_type: con
              id: con2
      """
    When We identify threats with references optional
    Then The threat status of q1 should be threat
    And  The threat status of ca1 should be threat
    And  The threat status of a2 should be threatened
    And  The threat status of con2 should be threat

  Scenario: Answer threatened by a question
    Given A conversation with an answer threatened by a question
      """
      node_type: question
      id: q1
      children:
        - node_type: answer
          id: a1
          children:
            - node_type: question
              id: q2
              children:
                - node_type: con_answer
                  id: ca1
      """
    When We identify threats with references optional
    Then The threat status of q1 should be unanswered
    And  The threat status of a1 should be threatened
    And  The threat status of q2 should be threat
    And  The threat status of ca1 should be threat
