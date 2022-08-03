@integration
Feature: Create a new quest

    After user logs in, if they have permission they goto create a new quest.
    Player gets to new quest page via the left menu. This is only visible if the User has permission to create quests.
    The player then fills out the new quest form and submits. If there are no issues in filling out the quest then after submitting form player is take to quest edit page.

    Background:
        Given User may click id logoff

    Scenario: Gets to create new quest form
        Given User logs in with "questcreator@example.com" / "password"
        # Has create quest permission
        And User opens leftdrawer
        And User selects create quest from menu
        Then Page title is "New Quest - SenseCraft"

    Scenario: Submits filled out quest form
        Given User logs in with "questcreator@example.com" / "password"
        # Has create quest permission
        And User opens leftdrawer
        And User selects create quest from menu
        When User fills name with "How to mitigate global climate change"
        And User fills class "q-editor__content" with "Climate change is increasingly causing havoc around the world. There are areas that have seen record high temperatures. Fires are increasing around the world. Some places are expeiencing record droughts While others are experiencing flooding. If climate change cannot be controled then there will be dire circumstances"
        And User fills handle with "climateChange"
        And User fills date startDate with 1 days
        And User fills date endDate with 10 days
        And User clicks updateQuestBtn
        Then User is editing quest "How to mitigate global climate change"
