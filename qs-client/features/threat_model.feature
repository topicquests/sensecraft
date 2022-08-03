@scoring
Feature: Threat model

  Scenario: Con needs support
    Given A conversation with an unsupported con
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
    When We identify threats
    Then The threat status of q1 should be unanswered
    And  The threat status of a1 should be unsupported
    And  The threat status of con1 should be unsupported

  Scenario: Supported con is a threat
    Given A conversation with an unsupported con
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
                - id: ref1
                  node_type: reference
      """
    When We identify threats
    Then The threat status of q1 should be unanswered
    And  The threat status of a1 should be threatened
    And  The threat status of con1 should be threat
    And  The threat status of ref1 should be support

  Scenario: You can support an answer directly
    Given A conversation with an answer supported by a reference
      """
      node_type: question
      id: q1
      children:
        - node_type: answer
          id: a1
          children:
            - node_type: reference
              id: ref1
      """
    When We identify threats
    Then The threat status of q1 should be answered
    And  The threat status of a1 should be support
    And  The threat status of ref1 should be support

  Scenario: You can support an answer indirectly
    Given A conversation with an answer supported by a reference
      """
      node_type: question
      id: q1
      children:
        - node_type: answer
          id: a1
          children:
            - node_type: pro
              id: pro1
              children:
                - node_type: reference
                  id: ref1
      """
    When We identify threats
    Then The threat status of q1 should be answered
    And  The threat status of a1 should be support
    And  The threat status of pro1 should be support
    And  The threat status of ref1 should be support

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
                - id: ref1
                  node_type: reference
                - node_type: con
                  id: con2
                  children:
                    - id: ref2
                      node_type: reference
      """
    When We identify threats
    Then The threat status of q1 should be unanswered
    And  The threat status of a1 should be unsupported
    And  The threat status of con1 should be threatened
    And  The threat status of con2 should be threat
    And  The threat status of ref2 should be support
    And  The threat status of ref1 should be support

  Scenario: Question with con_answer
    Given A conversation with a con_answer
      """
      node_type: question
      id: q1
      children:
        - node_type: con_answer
          id: ca1
          children:
            - id: pro1
              node_type: pro
              children:
                - id: ref1
                  node_type: reference
      """
    When We identify threats
    Then The threat status of q1 should be threat
    And  The threat status of ca1 should be threat
    And  The threat status of pro1 should be support
    And  The threat status of ref1 should be support

  Scenario: Question with con_answer and alternative
    Given A conversation with a con_answer and an alternative
      """
      node_type: question
      id: q1
      children:
        - node_type: con_answer
          id: ca1
          children:
            - id: pro1
              node_type: pro
              children:
                - id: ref1
                  node_type: reference
        - node_type: answer
          id: a2
          children:
            - id: pro2
              node_type: pro
              children:
                - id: ref2
                  node_type: reference
      """
    When We identify threats
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
          children:
            - id: pro1
              node_type: pro
              children:
                - id: ref1
                  node_type: reference
        - node_type: answer
          id: a2
          children:
            - id: pro1
              node_type: pro
              children:
                - id: ref2
                  node_type: reference
            - node_type: con
              id: con2
              children:
                - id: ref3
                  node_type: reference
      """
    When We identify threats
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
            - id: pro1
              node_type: pro
              children:
                - id: ref1
                  node_type: reference
            - node_type: question
              id: q2
              children:
                - node_type: con_answer
                  id: ca1
                  children:
                    - id: pro2
                      node_type: pro
                      children:
                        - id: ref2
                          node_type: reference
      """
    When We identify threats
    Then The threat status of q1 should be unanswered
    And  The threat status of a1 should be threatened
    And  The threat status of q2 should be threat
    And  The threat status of ca1 should be threat
