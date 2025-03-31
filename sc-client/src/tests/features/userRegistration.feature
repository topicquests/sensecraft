Feature: User Registration

  Scenario: Successful registration with valid details
    Given I open the registration page
    When I fill the registration form with valid details
    And I click the register button
    Then I should see a success message

  Scenario: Registration with missing email
    Given I open the registration page
    When I fill the registration form without an email
    And I click the register button
    Then I should see a validation error for missing email

  Scenario: Registration with invalid email format
    Given I open the registration page
    When I fill the registration form with an invalid email
    And I click the register button
    Then I should see a validation error for invalid email

