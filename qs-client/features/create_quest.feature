Feature: Create Quest
	Scenario: Show the quest page
		Given member is logged in
		And member has createQuest permision
		When createQuest page is requested
		Then new quest page is displayed