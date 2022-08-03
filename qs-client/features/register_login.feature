@integration
Feature: Logon to Sensecraft
  Scenario: Register a new user into Sensecraft
    Given The registration page
    When User fills email with "test@email.com"
    And User fills name with "test"
    And User fills handle with "test"
    And User fills password with "password"
    And User clicks registerButton
    Then Page title is "Sign In - SenseCraft"

  Scenario: Log into sensecraft web site
    Given The logon Page
    When User fills email with "test@email.com"
    And User fills password with "password"
    And User clicks loginBtn
    Then Page title is "Dashboard - SenseCraft"
