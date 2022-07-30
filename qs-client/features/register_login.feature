@integration
Feature: Logon to Sensecraft
  Scenario: Register a new user into Sensecraft
    Given A Registration page
    When User fills out registration page email as "test@email.com"
    And name as "test"
    And handle as "test"
    And password as "password"
    And User clicks Get Started button
    Then Goes to Signin page "Sign In - SenseCraft"

  Scenario: Log into sensecraft web site
    Given A Logon Page
    When user logged in using username as "test@email.com" and password as "password"
    And User clicks login
    Then Current page title "Dashboard - SenseCraft"
