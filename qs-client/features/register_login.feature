@integration
Feature: Register a new user into Sensecraft
    Background:
      Given User may click id logoff

    Scenario: Register
      Given The registration page
      When User fills email with "test@email.com"
      And User fills name with "test"
      And User fills handle with "test"
      And User fills password with "password"
      And User clicks registerButton
      Then Page title is "Sign In - SenseCraft"
      # Can we test for the flashing web message about having been sent email?
      And User test@email.com gets email with token

    Scenario: Use the email token
      Given User has token
      When User clicks on token link
      Then Page title is "Dashboard - Sensecraft"
      And The user is logged in

    Scenario: Logoff
      Given The logoff page
      Then The user is not logged in

    Scenario: Log into sensecraft web site
      Given The logon Page
      When User fills email with "test@email.com"
      And User fills password with "password"
      And User clicks loginBtn
      Then The user is logged in
