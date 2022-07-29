Feature: Create a new quest

    After user logs in, if they have permission they goto create a new quest.
    Player gets to new quest page via the left menu. This is only visible if the user has permission to create quests.
    The player then fills out the new quest form and submits. If there are no issues in filling out the quest then after submitting form player is take to quest edit page.

    Scenario: Gets to create new quest form
        Given User signs in with email "questcreator@example.com " and password "password". Has create quest permission
        When user opens leftdrawer
        And selects create quest from menu
        Then Create "New Quest - SenseCraft" form is displayed
    Scenario: Submits filled out quest form
        When Player enters name "How to mitigate global climate change"
        And enters description "Climate change is increasingly causing havoc around the world. There are areas that have seen record high temperatures. Fires are increasing around the world. Some places are expeiencing record droughts While others are experiencing flooding. If climate change cannot be controled then there will be dire circumstances"
        And enters "climateChange" for handle
        And start date of "2023-07-31 18:30"
        And end date of "2023-08-25 12:00"
        And clicks submit button
        Then player goes to quest edit page
